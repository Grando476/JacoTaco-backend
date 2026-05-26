import json
import time
from langchain_core.output_parsers import JsonOutputParser
from prompts import GENERATOR_PROMPT, SOLVER_PROMPT, FORMATTER_PROMPT, FINAL_VALIDATOR_PROMPT
from inspirations import get_generation_params

def invoke_with_retry(chain, params, max_retries=5, delay=10):
    for attempt in range(max_retries):
        try:
            return chain.invoke(params)
        except Exception as e:
            print(f"Błąd API. Czekam {delay}s (Próba {attempt+1}/{max_retries}): {e}")
            time.sleep(delay)
    return None

def run_generation_pipeline(llm, context, counts):
    parser = JsonOutputParser()

    for diff, total_count in counts.items():
        total_count = int(total_count)
        if total_count <= 0: continue
        
        batches = [5] * (total_count // 5) + ([total_count % 5] if total_count % 5 != 0 else [])
        
        for batch_count in batches:
            # FAZA I: KREATYWNY GENERATOR (Surowe zadania)
            gen_params = get_generation_params()
            gen_chain = GENERATOR_PROMPT | llm | parser
            raw_batch = invoke_with_retry(gen_chain, {"count": batch_count, "difficulty": diff, **gen_params, **context})
            if not raw_batch: continue
            if isinstance(raw_batch, dict): raw_batch = [raw_batch]

            # FAZA II: SUROWY SOLVER (Liczenie zadań)
            solv_chain = SOLVER_PROMPT | llm | parser
            solver_results = invoke_with_retry(solv_chain, {"tasks_batch_json": json.dumps(raw_batch, ensure_ascii=False)})
            if not solver_results: continue
            if isinstance(solver_results, dict): solver_results = [solver_results]

            # ŁĄCZENIE ZADAŃ POPRAWNYCH LOGICZNIE
            merged_for_formatter = []
            for i, task in enumerate(raw_batch):
                s_res = next((r for r in solver_results if r.get("task_index") == i), None)
                if s_res and s_res.get("is_valid"):
                    merged_for_formatter.append({
                        "raw_task": task,
                        "raw_solution": s_res.get("raw_solution", ""),
                        "solved_index": s_res.get("solved_index", 0)
                    })

            if not merged_for_formatter: continue

            # FAZA III: PERFEKCYJNY FORMATER (LaTeX i JSON escaping dla całego działającego batcha)
            form_chain = FORMATTER_PROMPT | llm | parser
            formatted_batch = invoke_with_retry(form_chain, {
                "merged_batch_json": json.dumps(merged_for_formatter, ensure_ascii=False),
                "difficulty": diff
            })
            if not formatted_batch: continue
            if isinstance(formatted_batch, dict): formatted_batch = [formatted_batch]

            # FAZA IV: BEZWZGLĘDNY WALIDATOR (Sprawdzanie każdego sformatowanego zadania z osobna)
            for formatted_task in formatted_batch:
                # Twarde wymuszenie żądanego poziomu trudności (zapobiega halucynacjom modelu)
                formatted_task["difficulty_level"] = diff

                val_chain = FINAL_VALIDATOR_PROMPT | llm | parser
                val_res = invoke_with_retry(val_chain, {
                    "final_task_json": json.dumps(formatted_task, ensure_ascii=False)
                })
                
                if val_res:
                    formatted_task["validation"] = {"is_perfect": val_res.get("is_perfect", False), "feedback": val_res.get("feedback")}
                else:
                    # Błąd spowodowany wyczerpanymi limitami (Rate limit) lub zepsutym parsowaniem JSON przez LLM
                    formatted_task["validation"] = {"is_perfect": False, "feedback": "Błąd API (Nie powiodła się finalna weryfikacja - sprawdź logi w terminalu)"}
                
                # Wyrzucamy gotowe zadanie od razu (Streaming JSONL)
                yield json.dumps(formatted_task, ensure_ascii=False) + "\n"