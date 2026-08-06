# Use Red Hat UBI minimal Python image (secure, actively maintained)
FROM registry.redhat.io/ubi9/python-311-minimal:latest

# Create non-root user for security
RUN useradd -m -u 1001 appuser

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
COPY --chown=appuser:appuser . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Switch to non-root user
USER 1001

# Run main.py when the container launches (bind to localhost only)
CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]
