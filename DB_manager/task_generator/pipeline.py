import json
import time
from langchain_core.output_parsers import JsonOutputParser
from prompts import GENERATOR_PROMPT, SOLVER_PROMPT, FINAL_VALIDATOR_PROMPT

def invoke_with_retry(chain, params, max_retries=5, delay=10):
    for attempt in range(max_retries):
        try:
            return chain.invoke(params)
        except Exception as e:
            print(f"Błąd API. Czekam {delay}s (Próba {attempt+1}/{max_retries}): {e}")
            time.sleep(delay)
    return None

# Zmień tylko funkcję run_generation_pipeline, reszta zostaje:
def run_generation_pipeline(llm, context, counts):
    parser = JsonOutputParser()

    for diff, total_count in counts.items():
        total_count = int(total_count)
        if total_count <= 0: continue
        
        batches = [5] * (total_count // 5) + ([total_count % 5] if total_count % 5 != 0 else [])
        
        for batch_count in batches:
            gen_chain = GENERATOR_PROMPT | llm | parser
            batch = invoke_with_retry(gen_chain, {"count": batch_count, "difficulty": diff, **context})
            if not batch: continue
            if isinstance(batch, dict): batch = [batch]

            solv_chain = SOLVER_PROMPT | llm | parser
            solver_results = invoke_with_retry(solv_chain, {"tasks_batch_json": json.dumps(batch, ensure_ascii=False)})
            if not solver_results: continue
            if isinstance(solver_results, dict): solver_results = [solver_results]

            for i, task in enumerate(batch):
                s_res = next((r for r in solver_results if r.get("task_index") == i), None)
                if s_res and s_res.get("is_valid"):
                    solved_idx = s_res.get("solved_index")
                    if solved_idx is not None and 0 <= solved_idx <= 3:
                        task["content"]["correct_index"] = solved_idx
                    
                    task["exemplary_solution"] = s_res.get("exemplary_solution", "")
                    val_chain = FINAL_VALIDATOR_PROMPT | llm | parser
                    val_res = invoke_with_retry(val_chain, {"final_task_json": json.dumps(task, ensure_ascii=False)})
                    task["validation"] = {"is_perfect": val_res.get("is_perfect", False) if val_res else False, "feedback": val_res.get("feedback") if val_res else "Błąd API"}
                    
                    # Wyrzucamy gotowe zadanie od razu (Streaming JSONL)
                    yield json.dumps(task, ensure_ascii=False) + "\n"