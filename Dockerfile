# Multi-stage Dockerfile supporting Finch container workflow & Amazon Corretto Java runtime
FROM amazoncorretto:17-alpine AS java-runtime-base

# Base Python runtime for Strands Agents SDK service
FROM python:3.11-slim

WORKDIR /app

# Copy Amazon Corretto Java tools if required for native validation steps
COPY --from=java-runtime-base /usr/lib/jvm/default-jvm /usr/lib/jvm/default-jvm
ENV JAVA_HOME=/usr/lib/jvm/default-jvm
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install only dependencies used by the local HTTP service. SAM packages the
# full backend/requirements.txt separately for deployed Lambda functions.
RUN pip install --no-cache-dir boto3

COPY backend/ ./backend/
COPY mock_backend.py ./mock_backend.py

EXPOSE 8000

CMD ["python3", "mock_backend.py"]
