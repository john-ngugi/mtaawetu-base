# Use the official Python image
FROM python:3.10-slim

# Set environment variables to prevent Python from writing .pyc files and buffering output
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc curl


# Copy the Poetry lock files
COPY pyproject.toml poetry.lock ./


# Install pipx and use it to install Poetry
# RUN pip install pipx && pipx ensurepath
# RUN pipx install poetry

# Copy project files to the container
COPY . /app/

# Use Poetry to install dependencies (using the pipx-installed Poetry)
RUN pip install -r requirements.txt
# RUN poetry install --no-root

# Expose the port for Django
EXPOSE 8000

# Run Django app
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]