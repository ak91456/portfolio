from django.db import migrations


ABOUT_TEXT = """Hi, I'm Arya Kaushal — a Backend, AI & DevOps Engineer based in Bhubaneswar, Odisha.

🎓 Education
B.Tech in Computer Science Engineering
Kalinga Institute of Industrial Technology (KIIT), 2022 – 2026
GPA: 8.41
Coursework: Data Structures & Algorithms, Operating Systems, Computer Networks, OOP, DBMS, Machine Learning

🛠 Technologies
Languages: C++, Python, C, Java, SQL, NoSQL, HTML, CSS, JavaScript
AI / ML: Machine Learning, Deep Learning, Generative AI
Cloud & DevOps: Git, GitHub, Linux, Docker, AWS, CI/CD
Web: Django, REST APIs

🏆 Certifications
• AWS Certification – Cloud Architecture
• AWS Certification – Machine Learning Foundations
• IBM Professional Data Science Certification"""


PROJECTS = [
    {
        "name": "Real-Time Instagram-Style App (Redis Pub/Sub)",
        "github_url": "https://github.com/ak91456/Real-Time-Instagram-Style-Application-with-Redis-Pub-Sub-Model",
        "description": (
            "Real-time social media platform built with Django & DRF featuring JWT auth, "
            "REST APIs for posts/likes/comments/follows, and Redis-powered Pub/Sub via Django Channels "
            "for instant WebSocket notifications. Containerised with Docker Compose (Django + Redis + Postgres) "
            "and automated with a GitHub Actions CI/CD pipeline."
        ),
        "order": 1,
    },
    {
        "name": "Fake News Detection System",
        "github_url": "https://github.com/ak91456/Fake-News-Detection",
        "description": (
            "End-to-end NLP classification system using Logistic Regression with TF-IDF vectorisation, "
            "stop-word removal, and text preprocessing. "
            "Achieved 97.2% accuracy · 97.5% recall · 99% precision · 98% F1-score."
        ),
        "order": 2,
    },
    {
        "name": "Brain Tumor Classification using XAI",
        "github_url": "https://github.com/ak91456/Brain-Tumor-Detection-XAI",
        "description": (
            "Deep learning pipeline using EfficientNet + Grad-CAM achieving 94% accuracy, 92% precision, "
            "and 91% F1-score. Integrated Explainable AI to visualise tumour regions, improving clinical "
            "interpretability for radiologists."
        ),
        "order": 3,
    },
    {
        "name": "Natural Language → SQL Query Converter",
        "github_url": "https://github.com/ak91456/natural-language-to-sql-query-convertor",
        "description": (
            "NLP-powered chatbot built with Django and NSQL-350M (Hugging Face) that translates natural "
            "language into SQL in real-time. 91% accuracy via REST API; improved data accessibility by 70% "
            "and reduced reliance on technical support for non-technical users."
        ),
        "order": 4,
    },
    {
        "name": "Emotion & Sentiment Analyser",
        "github_url": "https://github.com/ak91456/Emotion-Sentiment-Analyzer",
        "description": "Sentiment and emotion classification system using NLP techniques.",
        "order": 5,
    },
    {
        "name": "Application Tracking System",
        "github_url": "https://github.com/ak91456/Application-Tracking-System",
        "description": "Backend system for tracking job applications.",
        "order": 6,
    },
]


def seed_data(apps, schema_editor):
    AboutContent = apps.get_model("desktop", "AboutContent")
    Project = apps.get_model("desktop", "Project")

    if not AboutContent.objects.exists():
        AboutContent.objects.create(text=ABOUT_TEXT)

    if not Project.objects.exists():
        for p in PROJECTS:
            Project.objects.create(**p)


def unseed_data(apps, schema_editor):
    apps.get_model("desktop", "AboutContent").objects.all().delete()
    apps.get_model("desktop", "Project").objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("desktop", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_data, reverse_code=unseed_data),
    ]
