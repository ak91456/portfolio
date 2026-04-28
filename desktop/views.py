import json
import os

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import AboutContent, Project
from .services.filesystem.commands import execute_command
from .services.filesystem.tree import build_tree

GROQ_SYSTEM_PROMPT = """
You ARE Arya Kaushal. Speak in first person as Arya himself.
Recruiters and developers are visiting your portfolio (AryaOS) and asking you questions.

About you:
- Name: Arya Kaushal
- Role: Backend, AI & DevOps Engineer
- Location: Bhubaneswar, Odisha
- Education: B.Tech in Computer Science Engineering, KIIT (2022–2026), GPA: 8.41
- Skills: Python, Django, FastAPI, Node.js, LangChain, RAG, Embeddings, PyTorch, Docker, Kubernetes, CI/CD, PostgreSQL, Redis
- Projects: AryaOS (browser-based desktop OS), Real-Time Instagram-Style App (Redis Pub/Sub), Fake News Detection System, Brain Tumor Classification using XAI, Natural Language to SQL Query Converter, Emotion & Sentiment Analyser, Application Tracking System
- GitHub: https://github.com/ak91456
- LinkedIn: https://www.linkedin.com/in/arya-kaushal-aa530725b/
- LeetCode: https://leetcode.com/u/ak91456/
- Certifications: AWS Cloud Architecture, AWS Machine Learning Foundations, IBM Professional Data Science
- Open to: Remote, internships, full-time backend or AI/ML roles

Rules:
- Always speak as "I", never refer to yourself in third person
- Be concise and friendly — recruiters are busy
- If you don't know something, say so honestly
- Keep responses short — 2-4 sentences max unless asked for detail
""".strip()


# ── Desktop UI ────────────────────────────────────────────────────────────────

def desktop(request):
    return render(request, "desktop/index.html")


# ── About API ─────────────────────────────────────────────────────────────────

def about_content(request):
    obj = AboutContent.objects.first()
    text = obj.text if obj else ""
    return JsonResponse({"text": text}, json_dumps_params={"ensure_ascii": False})


# ── Projects API ──────────────────────────────────────────────────────────────

def projects_list(request):
    projects = list(
        Project.objects.values("name", "github_url", "description")
    )
    return JsonResponse({"projects": projects}, json_dumps_params={"ensure_ascii": False})


# ── File Tree API ─────────────────────────────────────────────────────────────

def file_tree(request):
    path = request.GET.get("path", "")
    tree = build_tree(path)

    if tree is None:
        return JsonResponse({"error": "invalid path"}, status=404)

    return JsonResponse(tree, safe=False)


# ── Terminal API ──────────────────────────────────────────────────────────────

@csrf_exempt
def terminal_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "invalid request method"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=400)

    command = data.get("command", "").strip()
    cwd = data.get("cwd", "/")

    if not command:
        return JsonResponse({"cwd": cwd})

    result = execute_command(cwd, command)
    return JsonResponse(result)


# ── AI Chat API ───────────────────────────────────────────────────────────────

@csrf_exempt
def chat_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=400)

    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return JsonResponse({"error": "empty message"}, status=400)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return JsonResponse({"error": "GROQ_API_KEY not configured"}, status=500)

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        messages = [{"role": "system", "content": GROQ_SYSTEM_PROMPT}]
        for h in history[-6:]:   # keep last 3 turns for context
            if h.get("role") in ("user", "assistant") and h.get("content"):
                messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=300,
        )
        reply = resp.choices[0].message.content
        return JsonResponse({"reply": reply})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
