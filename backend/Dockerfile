FROM python:3.10.18-slim-trixie

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

ADD https://astral.sh/uv/install.sh /uv-installer.sh

RUN sh /uv-installer.sh && rm /uv-installer.sh

ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

COPY uv.lock pyproject.toml ./

RUN uv sync --frozen

COPY . .

EXPOSE 5000

CMD ["uv", "run", "main.py"]