# Use Red Hat UBI Python image (no subscription required)
# ubi9/python-311 already ships with a non-root "default" user at UID 1001
FROM registry.access.redhat.com/ubi9/python-311:latest

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
COPY --chown=1001:0 . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Switch to the built-in non-root user (UID 1001)
USER 1001

# Run main.py when the container launches (bind to localhost only)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
