FROM python:3.11-slim

# Python environment settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copying dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copying source code
COPY . .

# Exposing port for uvicorn (Render uses PORT variable by default, if not specified - can be overwritten)
EXPOSE 8000

# Starting command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
