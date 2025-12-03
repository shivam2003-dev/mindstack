# Site Reliability Engineer AIML - Associate Resources

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🤖 SRE for AI/ML Systems</h2>
  <p style="margin: 1rem 0 0 0;">Comprehensive resources for Site Reliability Engineering in AI/ML infrastructure, LLM serving, monitoring, and incident response.</p>
</div>

## 📖 Books

???+ "SRE & Reliability Engineering"
    1. [Site Reliability Engineering: How Google Runs Production Systems](https://sre.google/books/) - Google SRE Team (Free)
    2. [The Site Reliability Workbook](https://sre.google/workbook/) - Google SRE Team (Free)
    3. [Building Secure and Reliable Systems](https://sre.google/books/building-secure-reliable-systems/) - Google SRE Team (Free)
    4. [Reliability Engineering Handbook](https://www.amazon.com/Reliability-Engineering-Handbook-Bryan-Dodson/dp/0831132983) - Bryan Dodson
    5. [Chaos Engineering](https://www.oreilly.com/library/view/chaos-engineering/9781491988459/) - Casey Rosenthal & Nora Jones

???+ "ML Operations & MLOps"
    1. [MLOps: Continuous delivery and automation pipelines in machine learning](https://www.oreilly.com/library/view/mlops-continuous-delivery/9781098103002/) - Mark Treveil & Dataiku Team
    2. [Practical MLOps](https://www.oreilly.com/library/view/practical-mlops/9781098103002/) - Noah Gift & Alfredo Deza
    3. [Building Machine Learning Powered Applications](https://www.oreilly.com/library/view/building-machine-learning/9781492045106/) - Emmanuel Ameisen
    4. [Designing Machine Learning Systems](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/) - Chip Huyen

???+ "AI/ML Infrastructure & Serving"
    1. [High Performance Browser Networking](https://www.oreilly.com/library/view/high-performance-browser/9781449344767/) - Ilya Grigorik
    2. [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) - Martin Kleppmann
    3. [Systems Performance: Enterprise and the Cloud](https://www.oreilly.com/library/view/systems-performance-2nd/9780136820154/) - Brendan Gregg

## 📄 Research Papers

???+ "SLO/SLA for AI Systems"
    1. [SLOs for ML Systems](https://arxiv.org/abs/2301.13017) - Service Level Objectives for Machine Learning
    2. [Monitoring and Explainability of Models in Production](https://arxiv.org/abs/2007.06299) - ML Monitoring Best Practices
    3. [Continuous Training for Production ML](https://arxiv.org/abs/1907.12475) - Continuous Learning Systems
    4. [The Tail at Scale](https://research.google/pubs/pub40801/) - Google research on latency optimization

???+ "ML Model Serving & Inference"
    1. [Clipper: A Low-Latency Online Prediction Serving System](https://www.usenix.org/conference/nsdi17/technical-sessions/presentation/crankshaw) - NSDI 2017
    2. [InferLine: ML Inference Pipeline Composition Framework](https://www.usenix.org/conference/atc20/presentation/romero) - USENIX ATC 2020
    3. [Serving DNNs like Clockwork: Performance Predictability from the Bottom Up](https://www.usenix.org/conference/osdi20/presentation/gujarati) - OSDI 2020
    4. [Batch Processing for ML Inference](https://arxiv.org/abs/2003.00133) - Efficient Batch Inference

???+ "Model Drift & Monitoring"
    1. [Failing Loudly: An Empirical Study of Methods for Detecting Dataset Shift](https://arxiv.org/abs/1810.11953) - Dataset Shift Detection
    2. [Monitoring ML Models in Production](https://arxiv.org/abs/2007.06299) - Production ML Monitoring
    3. [A Survey on Concept Drift Adaptation](https://arxiv.org/abs/1404.6500) - Concept Drift in ML
    4. [Data Validation for Machine Learning](https://arxiv.org/abs/1903.03008) - Data Quality Monitoring

???+ "LLM Serving & Performance"
    1. [Efficiently Scaling Transformer Inference](https://arxiv.org/abs/2211.05102) - Transformer Inference Optimization
    2. [vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention](https://arxiv.org/abs/2309.06180) - Efficient LLM Serving
    3. [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu) - OSDI 2022
    4. [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) - Speculative Decoding

???+ "Cost Optimization & Resource Management"
    1. [Gandiva: Introspective Cluster Scheduling for Deep Learning](https://www.usenix.org/conference/osdi18/presentation/xiao) - GPU Scheduling
    2. [Optimus: An Efficient Dynamic Resource Scheduler for Deep Learning Clusters](https://www.usenix.org/conference/eurosys18/presentation/peng) - Resource Scheduling
    3. [The Case for Learned Index Structures](https://arxiv.org/abs/1712.01208) - Learned Indexes

## ⭐ GitHub Repositories

???+ "ML Observability & Monitoring"
    1. [OpenInference](https://github.com/Arize-ai/openinference) - Open standard for ML observability
    2. [Evidently AI](https://github.com/evidentlyai/evidently) - ML model monitoring and drift detection
    3. [Arize AI Phoenix](https://github.com/Arize-ai/phoenix) - Open-source ML observability
    4. [WhyLabs](https://github.com/whylabs/whylogs) - Data logging and monitoring for ML
    5. [Fiddler AI](https://github.com/fiddler-labs) - ML monitoring and explainability

???+ "LLM Serving & Inference"
    1. [vLLM](https://github.com/vllm-project/vllm) - Fast LLM inference and serving
    2. [Text Generation Inference](https://github.com/huggingface/text-generation-inference) - Hugging Face LLM serving
    3. [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) - NVIDIA's LLM inference optimization
    4. [Ray Serve](https://github.com/ray-project/ray) - Scalable model serving framework
    5. [Seldon Core](https://github.com/SeldonIO/seldon-core) - ML model deployment on Kubernetes

???+ "MLOps & Model Deployment"
    1. [MLflow](https://github.com/mlflow/mlflow) - ML lifecycle platform
    2. [Kubeflow](https://github.com/kubeflow/kubeflow) - ML toolkit for Kubernetes
    3. [BentoML](https://github.com/bentoml/BentoML) - Model serving framework
    4. [Cortex](https://github.com/cortexlabs/cortex) - ML model serving platform
    5. [Triton Inference Server](https://github.com/triton-inference-server/server) - NVIDIA's inference server

???+ "SRE & Reliability Tools"
    1. [Google SRE Book](https://github.com/google/sre-book) - Site Reliability Engineering book
    2. [Awesome SRE](https://github.com/dastergon/awesome-sre) - Curated SRE resources
    3. [Chaos Engineering](https://github.com/chaos-mesh/chaos-mesh) - Chaos engineering for Kubernetes
    4. [Litmus](https://github.com/litmuschaos/litmus) - Cloud-native chaos engineering
    5. [Gremlin](https://github.com/gremlin/gremlin-python) - Chaos engineering platform

???+ "OpenTelemetry & Observability"
    1. [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification) - Observability standard
    2. [OpenTelemetry Python](https://github.com/open-telemetry/opentelemetry-python) - Python instrumentation
    3. [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) - K8s operator for OTel
    4. [Prometheus](https://github.com/prometheus/prometheus) - Metrics collection and alerting
    5. [Grafana](https://github.com/grafana/grafana) - Visualization and dashboards

???+ "Cost Optimization & GPU Management"
    1. [Kubernetes GPU Scheduler](https://github.com/NVIDIA/k8s-device-plugin) - NVIDIA GPU support for K8s
    2. [GKE GPU Sharing](https://github.com/GoogleCloudPlatform/gke-gpu-sharing) - GPU sharing in GKE
    3. [KubeCost](https://github.com/kubecost/kubecost) - Kubernetes cost monitoring
    4. [Cluster Autoscaler](https://github.com/kubernetes/autoscaler) - K8s cluster autoscaling

## 🎥 Videos & Courses

???+ "SRE Courses"
    1. [Google SRE Training](https://sre.google/education/) - Google's SRE education resources
    2. [Site Reliability Engineering Course (Coursera)](https://www.coursera.org/learn/site-reliability-engineering-slos) - SRE fundamentals
    3. [Chaos Engineering Course](https://www.oreilly.com/live-training/courses/chaos-engineering/0636920052280/) - O'Reilly training

???+ "MLOps & Production ML"
    1. [Full Stack Deep Learning](https://fullstackdeeplearning.com/) - Production ML course
    2. [MLOps Specialization (Coursera)](https://www.coursera.org/specializations/mlops-machine-learning-duke) - MLOps fundamentals
    3. [Made With ML](https://madewithml.com/) - Production ML best practices
    4. [Stanford CS329S: Machine Learning Systems Design](https://stanford-cs329s.github.io/) - ML systems course

???+ "LLM Serving & Inference"
    1. [Efficient LLM Inference (YouTube)](https://www.youtube.com/results?search_query=llm+inference+optimization) - Various tutorials
    2. [vLLM Tutorial](https://docs.vllm.ai/) - vLLM documentation and guides
    3. [Hugging Face Inference Course](https://huggingface.co/course) - Model serving with HF

???+ "Observability & Monitoring"
    1. [OpenTelemetry Course](https://opentelemetry.io/docs/) - Official OTel documentation
    2. [Prometheus & Grafana Tutorials](https://prometheus.io/docs/tutorials/) - Monitoring stack
    3. [Datadog Learning Center](https://www.datadoghq.com/learn/) - Observability best practices

## 📰 Articles & Blogs

???+ "SRE for AI/ML"
    1. [Google AI Blog - ML Reliability](https://ai.googleblog.com/) - Google's AI reliability practices
    2. [Netflix Tech Blog - ML Infrastructure](https://netflixtechblog.com/tagged/machine-learning) - Netflix ML systems
    3. [Uber Engineering - ML Platform](https://eng.uber.com/tag/machine-learning/) - Uber's ML infrastructure
    4. [LinkedIn Engineering - ML Serving](https://engineering.linkedin.com/blog) - LinkedIn ML systems

???+ "LLM Serving & Performance"
    1. [Anyscale Blog - LLM Serving](https://www.anyscale.com/blog) - LLM inference optimization
    2. [Together AI Blog](https://together.ai/blog) - LLM infrastructure insights
    3. [vLLM Blog Posts](https://blog.vllm.ai/) - vLLM performance and features
    4. [Hugging Face Blog - Inference](https://huggingface.co/blog/tag/inference) - Model serving best practices

???+ "ML Monitoring & Observability"
    1. [Arize AI Blog](https://arize.com/blog/) - ML observability and monitoring
    2. [Evidently AI Blog](https://www.evidentlyai.com/blog) - ML model monitoring
    3. [WhyLabs Blog](https://whylabs.ai/blog) - Data quality and monitoring
    4. [Fiddler AI Blog](https://www.fiddler.ai/blog) - ML explainability and monitoring

???+ "SLO/SLA & Reliability"
    1. [Google SRE Book - SLOs](https://sre.google/sre-book/service-level-objectives/) - SLO best practices
    2. [SLO Engineering Guide](https://sre.google/workbook/slo-document/) - SLO documentation
    3. [Error Budgets](https://sre.google/workbook/error-budget-policy/) - Error budget management
    4. [Reliability Engineering Blog](https://www.usenix.org/blog) - USENIX reliability articles

???+ "Cost Optimization"
    1. [AWS Cost Optimization for ML](https://aws.amazon.com/blogs/machine-learning/) - AWS ML cost optimization
    2. [Google Cloud - ML Cost Optimization](https://cloud.google.com/blog/products/ai-machine-learning) - GCP cost strategies
    3. [GPU Cost Optimization](https://www.databricks.com/blog) - Databricks cost optimization

???+ "Incident Response & Chaos Engineering"
    1. [Chaos Engineering Principles](https://principlesofchaos.org/) - Chaos engineering manifesto
    2. [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering) - Netflix chaos practices
    3. [Gremlin Blog](https://www.gremlin.com/blog/) - Chaos engineering insights
    4. [Incident Response Playbooks](https://response.pagerduty.com/) - PagerDuty incident response

## 🔗 Recommended Reading

???+ "AI-Specific Observability Tools"
    1. [OpenInference Specification](https://github.com/Arize-ai/openinference) - ML observability standard
    2. [OpenTelemetry for ML](https://opentelemetry.io/docs/) - Observability for AI systems
    3. [MLflow Tracking](https://mlflow.org/docs/latest/tracking.html) - ML experiment tracking
    4. [Weights & Biases](https://wandb.ai/) - ML experiment tracking and monitoring
    5. [Neptune AI](https://neptune.ai/) - ML experiment management

???+ "SLO/SLA Frameworks for AI"
    1. [SLOs for ML Systems (Paper)](https://arxiv.org/abs/2301.13017) - Academic research
    2. [Google SRE SLO Guide](https://sre.google/workbook/slo-document/) - Practical SLO implementation
    3. [SLI/SLO/SLA Best Practices](https://sre.google/sre-book/service-level-objectives/) - Google's approach
    4. [AI Metrics: Accuracy, Fairness, Latency](https://www.microsoft.com/en-us/research/publication/fairness-accountability-transparency-machine-learning/) - Fairness in ML

???+ "LLM Performance Metrics"
    1. [TTFT (Time To First Token) Optimization](https://arxiv.org/abs/2309.06180) - vLLM paper
    2. [TPOT (Time Per Output Token) Metrics](https://www.anyscale.com/blog/announcing-ray-serve-production-grade-model-serving) - Ray Serve blog
    3. [LLM Latency Benchmarks](https://lmsys.org/blog/2023-06-20-llm-benchmark/) - LMSYS benchmarks
    4. [Inference Performance Guide](https://huggingface.co/docs/transformers/perf_infer_gpu_one) - Hugging Face optimization

???+ "Model Drift & Continuous Evaluation"
    1. [Data Drift Detection](https://arxiv.org/abs/1810.11953) - Research paper
    2. [Concept Drift Adaptation](https://arxiv.org/abs/1404.6500) - Survey paper
    3. [Continuous ML Monitoring](https://arxiv.org/abs/2007.06299) - Production monitoring
    4. [ML Model Validation](https://arxiv.org/abs/1903.03008) - Data validation

???+ "AI Incident Response"
    1. [AI Circuit Breakers](https://www.usenix.org/conference/osdi20/presentation/gujarati) - Fault tolerance for ML
    2. [Automated Rollback Strategies](https://arxiv.org/abs/1907.12475) - Continuous training
    3. [ML Incident Response Playbooks](https://github.com/google/sre-book) - SRE incident management
    4. [Chaos Engineering for ML](https://github.com/chaos-mesh/chaos-mesh) - Testing ML resilience

???+ "GPU Scheduling & Resource Management"
    1. [Kubernetes GPU Scheduling](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/) - K8s GPU docs
    2. [GPU Sharing Strategies](https://arxiv.org/abs/1907.12201) - Multi-tenant GPU sharing
    3. [Resource Optimization for ML](https://www.usenix.org/conference/osdi18/presentation/xiao) - Gandiva paper
    4. [GPU Cost Optimization](https://cloud.google.com/kubernetes-engine/docs/how-to/gpus) - GKE GPU guide

???+ "AI Gateways & Load Balancing"
    1. [AI Gateway Architecture](https://www.getport.io/blog/ai-gateway) - AI gateway patterns
    2. [Load Balancing for ML Inference](https://www.usenix.org/conference/nsdi17/technical-sessions/presentation/crankshaw) - Clipper paper
    3. [Caching Strategies for LLMs](https://arxiv.org/abs/2309.06180) - vLLM caching
    4. [Traffic Management for AI](https://istio.io/latest/docs/tasks/traffic-management/) - Istio for ML

???+ "Cost Optimization for AI Infrastructure"
    1. [AWS Cost Optimization](https://aws.amazon.com/blogs/machine-learning/category/artificial-intelligence/cost-optimization/) - AWS strategies
    2. [GCP ML Cost Management](https://cloud.google.com/architecture/ml-on-gcp-best-practices) - GCP best practices
    3. [Kubernetes Cost Optimization](https://www.kubecost.com/) - Kubecost tooling
    4. [GPU Cost Analysis](https://www.databricks.com/blog/2023/04/18/optimizing-gpu-costs-for-llm-inference.html) - Databricks insights

???+ "Multi-Region & Multi-Cloud AI"
    1. [Multi-Region ML Deployment](https://aws.amazon.com/blogs/machine-learning/deploying-ml-models-across-multiple-regions/) - AWS guide
    2. [Kubernetes Multi-Cluster](https://kubernetes.io/docs/concepts/cluster-administration/federation/) - K8s federation
    3. [Disaster Recovery for ML](https://sre.google/workbook/disaster-recovery/) - SRE disaster recovery
    4. [Failover Strategies](https://www.usenix.org/conference/osdi20/presentation/gujarati) - ML system failover

???+ "Security for AI Infrastructure"
    1. [ML Security Best Practices](https://owasp.org/www-project-machine-learning-security-top-10/) - OWASP ML Top 10
    2. [AI Model Security](https://arxiv.org/abs/2004.07213) - Adversarial attacks
    3. [Secure ML Deployment](https://www.nist.gov/publications/securing-artificial-intelligence-ai-systems) - NIST guidelines
    4. [Kubernetes Security](https://kubernetes.io/docs/concepts/security/) - K8s security practices

???+ "Chaos Engineering & Resilience Testing"
    1. [Chaos Engineering Principles](https://principlesofchaos.org/) - Core principles
    2. [Chaos Mesh Documentation](https://chaos-mesh.org/docs/) - Chaos engineering tool
    3. [Litmus Chaos](https://litmuschaos.io/docs/) - Cloud-native chaos
    4. [Resilience Testing for ML](https://www.usenix.org/conference/osdi20/presentation/gujarati) - ML system resilience

???+ "Continuous Integration for ML"
    1. [ML CI/CD Best Practices](https://ml-ops.org/content/mlops-principles) - MLOps principles
    2. [GitHub Actions for ML](https://github.com/features/actions) - CI/CD automation
    3. [ML Testing Strategies](https://arxiv.org/abs/1907.12475) - Testing ML systems
    4. [Pre-deployment Validation](https://arxiv.org/abs/2007.06299) - ML validation

