FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY Backend/requirements.txt ./Backend/requirements.txt
RUN pip install --no-cache-dir -r Backend/requirements.txt

# Copy repository
COPY . /app

EXPOSE 8000
CMD ["uvicorn", "Backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
