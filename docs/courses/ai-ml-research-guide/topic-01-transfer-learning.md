# Topic 1: Transfer Learning & Fine-tuning

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Research Topic Guide</h2>
  <p style="margin: 1rem 0 0 0;">Complete resource guide for Transfer Learning & Fine-tuning research</p>
</div>

## 📚 What to Learn

### Core Concepts
- **Pre-training**: Training on large datasets
- **Fine-tuning**: Adapting to specific tasks
- **Feature extraction**: Using pre-trained features
- **Domain adaptation**: Transferring across domains
- **Few-shot learning**: Learning with few examples

### Key Skills
- Understanding pre-trained models
- Fine-tuning strategies
- Domain adaptation techniques
- Efficient fine-tuning (LoRA, adapters)
- Evaluation and benchmarking

!!! tip "Learning Path"
    Start with basic concepts, then move to modern methods like foundation models and efficient fine-tuning.

## 📖 Survey Papers (Start Here!)

???+ "📋 Essential Survey Papers"
    1. **"A Survey on Transfer Learning" (2009)**
       - Authors: Pan, Yang
       - Link: https://ieeexplore.ieee.org/document/5288526
       - Why: Classic survey, foundational concepts
       - Difficulty: Beginner-friendly
    
    2. **"Transfer Learning for Computer Vision Tasks: A Survey" (2022)**
       - Authors: Zhuang, Zhai, Yamins
       - Link: https://arxiv.org/abs/2201.04844
       - Why: Comprehensive modern survey
       - Difficulty: Intermediate
    
    3. **"A Comprehensive Survey on Transfer Learning" (2020)**
       - Authors: Zhuang, Qi, Duan, et al.
       - Link: https://arxiv.org/abs/1911.02685
       - Why: Very comprehensive, covers all aspects
       - Difficulty: Intermediate

!!! success "Start with Surveys"
    Always start with survey papers to get overview of the field before diving into specific papers.

## 🏛️ Classic Papers (Must Read)

???+ "⭐ Foundational Papers"
    1. **"ImageNet Classification with Deep Convolutional Neural Networks" (2012)**
       - Authors: Krizhevsky, Sutskever, Hinton
       - Link: https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks
       - Code: https://github.com/pytorch/vision/tree/main/torchvision/models
       - Impact: Started transfer learning revolution
       - Difficulty: Beginner-friendly
    
    2. **"How transferable are features in deep neural networks?" (2014)**
       - Authors: Yosinski, Clune, Bengio, Lipson
       - Link: https://arxiv.org/abs/1411.1792
       - Code: https://github.com/yosinski/transfer-learning-survey
       - Impact: Explained what transfers and why
       - Difficulty: Beginner-friendly
    
    3. **"Deep Residual Learning for Image Recognition" (2015)**
       - Authors: He, Zhang, Ren, Sun
       - Link: https://arxiv.org/abs/1512.03385
       - Code: https://github.com/pytorch/vision/tree/main/torchvision/models
       - Impact: ResNet became standard backbone
       - Difficulty: Intermediate

## 🚀 Modern Papers (Recent & Important)

???+ "🔥 Recent Important Papers"
    1. **"BERT: Pre-training of Deep Bidirectional Transformers" (2018)**
       - Authors: Devlin, Chang, Lee, Toutanova
       - Link: https://arxiv.org/abs/1810.04805
       - Code: https://github.com/google-research/bert
       - Venue: NAACL 2019
       - Difficulty: Intermediate
    
    2. **"An Image is Worth 16x16 Words: Transformers for Image Recognition" (2020)**
       - Authors: Dosovitskiy, Beyer, Kolesnikov, et al.
       - Link: https://arxiv.org/abs/2010.11929
       - Code: https://github.com/google-research/vision_transformer
       - Venue: ICLR 2021
       - Difficulty: Intermediate
    
    3. **"LoRA: Low-Rank Adaptation of Large Language Models" (2021)**
       - Authors: Hu, Shen, Wallis, et al.
       - Link: https://arxiv.org/abs/2106.09685
       - Code: https://github.com/microsoft/LoRA
       - Venue: ICLR 2022
       - Difficulty: Intermediate
    
    4. **"EfficientNet: Rethinking Model Scaling" (2019)**
       - Authors: Tan, Le
       - Link: https://arxiv.org/abs/1905.11946
       - Code: https://github.com/tensorflow/tpu/tree/master/models/official/efficientnet
       - Venue: ICML 2019
       - Difficulty: Intermediate

## 📝 Tutorial Papers (Beginner-Friendly)

???+ "🎓 Tutorial & Educational Papers"
    1. **"Transfer Learning Tutorial" (2018)**
       - Link: https://github.com/jindongwang/transferlearning-tutorial
       - Why: Comprehensive tutorial with code
       - Difficulty: Beginner
    
    2. **"Fine-tuning Deep Networks" - Fast.ai Course**
       - Link: https://course.fast.ai/
       - Why: Practical tutorial with code
       - Difficulty: Beginner
    
    3. **"Transfer Learning in Computer Vision" - PyTorch Tutorial**
       - Link: https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html
       - Why: Step-by-step implementation
       - Difficulty: Beginner

## 💻 Code Implementation Papers

???+ "🔧 Papers with Excellent Code"
    1. **"Vision Transformer (ViT)"**
       - Code: https://github.com/google-research/vision_transformer
       - Framework: JAX/Flax
       - Quality: Official, well-documented
    
    2. **"BERT"**
       - Code: https://github.com/google-research/bert
       - Framework: TensorFlow
       - Quality: Official implementation
    
    3. **"LoRA"**
       - Code: https://github.com/microsoft/LoRA
       - Framework: PyTorch
       - Quality: Official, easy to use
    
    4. **"EfficientNet"**
       - Code: https://github.com/tensorflow/tpu/tree/master/models/official/efficientnet
       - Framework: TensorFlow
       - Quality: Official
    
    5. **"Hugging Face Transformers"**
       - Code: https://github.com/huggingface/transformers
       - Framework: PyTorch/TensorFlow
       - Quality: Industry standard, many models

!!! tip "Code First Approach"
    For beginners, start with code implementations to understand concepts, then read papers.

## 📊 Where to Track Papers

### Paper Discovery Platforms

???+ "🔍 Paper Discovery"
    1. **Papers With Code - Transfer Learning**
       - URL: https://paperswithcode.com/task/transfer-learning
       - Features: Papers with code, leaderboards, SOTA tracking
       - Best for: Finding implementations
    
    2. **arXiv - Machine Learning**
       - URL: https://arxiv.org/list/cs.LG/recent
       - Features: Latest preprints, daily updates
       - Best for: Latest papers
    
    3. **Google Scholar**
       - URL: https://scholar.google.com/
       - Search: "transfer learning" OR "fine-tuning" OR "domain adaptation"
       - Best for: Comprehensive search
    
    4. **Semantic Scholar**
       - URL: https://www.semanticscholar.org/
       - Features: AI-powered recommendations
       - Best for: Finding related papers
    
    5. **Connected Papers**
       - URL: https://www.connectedpapers.com/
       - Features: Visual paper graphs
       - Best for: Exploring research area

### Conference Proceedings

???+ "📅 Top Venues"
    1. **NeurIPS** (December)
       - URL: https://papers.nips.cc/
       - Search: Transfer learning, fine-tuning
       - Best papers: https://papers.nips.cc/paper_files/paper/2023
    
    2. **ICML** (July)
       - URL: https://proceedings.mlr.press/
       - Search: Transfer learning
       - Best papers: Recent proceedings
    
    3. **ICLR** (May)
       - URL: https://openreview.net/group?id=ICLR.cc
       - Search: Transfer learning, fine-tuning
       - Open review: See reviews
    
    4. **CVPR** (June)
       - URL: https://openaccess.thecvf.com/CVPR
       - Search: Transfer learning, domain adaptation
       - Best for: Vision applications

## 📥 How to Get Papers

### Free Access Methods

???+ "🆓 Free Access"
    1. **arXiv** - All papers free
       - Direct download PDF
       - No registration needed
    
    2. **OpenReview** - ICLR papers
       - All ICLR papers free
       - Includes reviews
    
    3. **Google Scholar** - PDF links
       - Many papers have free PDFs
       - Check "All X versions"
    
    4. **Semantic Scholar** - Free access
       - Many papers available
       - Direct PDF links
    
    5. **Author Websites** - Personal pages
       - Many authors post PDFs
       - Check personal websites
    
    6. **ResearchGate** - Academic social network
       - Request papers from authors
       - Many authors share PDFs

!!! tip "Getting Papers"
    Most ML papers are on arXiv (free). Check author websites for official versions.

## 📚 Learning Resources

### Courses & Tutorials

???+ "🎓 Courses"
    1. **Fast.ai - Practical Deep Learning**
       - URL: https://course.fast.ai/
       - Focus: Transfer learning practical
       - Level: Beginner-friendly
    
    2. **CS231n - Stanford**
       - URL: https://cs231n.stanford.edu/
       - Focus: Computer vision, transfer learning
       - Level: Intermediate
    
    3. **Hugging Face Course**
       - URL: https://huggingface.co/course
       - Focus: Transformers, fine-tuning
       - Level: Beginner to Intermediate

### Books

???+ "📖 Books"
    1. **"Deep Learning" by Goodfellow, Bengio, Courville**
       - Free: https://www.deeplearningbook.org/
       - Chapter: Transfer learning concepts
    
    2. **"Hands-On Machine Learning" by Aurélien Géron**
       - Chapter: Transfer learning practical guide

### Blogs & Articles

???+ "📰 Blogs"
    1. **Jay Alammar's Blog**
       - URL: http://jalammar.github.io/
       - Focus: Transformers, BERT explained
    
    2. **Lil'Log by Lilian Weng**
       - URL: https://lilianweng.github.io/
       - Focus: Research summaries, transfer learning

## 🎯 Reading Strategy

### Week 1: Foundations
1. Read survey paper (#1 from surveys)
2. Read classic papers (#1-3 from classics)
3. Implement basic fine-tuning (PyTorch tutorial)

### Week 2: Modern Methods
1. Read BERT paper
2. Read ViT paper
3. Try Hugging Face fine-tuning

### Week 3: Advanced Topics
1. Read LoRA paper
2. Read EfficientNet paper
3. Implement efficient fine-tuning

### Week 4: Recent Work
1. Follow arXiv for latest papers
2. Read 2-3 recent papers
3. Implement one method

!!! success "Reading Plan"
    Follow this 4-week plan to build solid foundation in transfer learning.

## 🔔 Stay Updated

### RSS Feeds & Alerts

???+ "📡 Alerts"
    1. **arXiv RSS Feed**
       - URL: https://arxiv.org/list/cs.LG/recent?show=100
       - Subscribe: RSS reader (Feedly, etc.)
       - Check: Daily
    
    2. **Google Scholar Alerts**
       - Setup: Alert for "transfer learning"
       - Frequency: Weekly digest
    
    3. **Papers With Code Newsletter**
       - URL: https://paperswithcode.com/newsletter
       - Frequency: Weekly

### Social Media

???+ "📱 Social Tracking"
    1. **Twitter/X**
       - Follow: @paperswithcode, researchers
       - Hashtag: #TransferLearning, #FineTuning
    
    2. **Reddit**
       - r/MachineLearning
       - r/learnmachinelearning
    
    3. **LinkedIn**
       - Follow: Research groups, companies

## 📋 To-Do Checklist

### Beginner Level
- [ ] Read survey paper on transfer learning
- [ ] Read 3 classic papers (ImageNet, Transferability, ResNet)
- [ ] Complete PyTorch transfer learning tutorial
- [ ] Implement basic fine-tuning on CIFAR-10
- [ ] Read BERT paper and understand concepts

### Intermediate Level
- [ ] Read Vision Transformer (ViT) paper
- [ ] Implement fine-tuning with Hugging Face
- [ ] Read LoRA paper and understand efficient fine-tuning
- [ ] Implement LoRA fine-tuning
- [ ] Read 5 recent papers from top venues

### Advanced Level
- [ ] Read domain adaptation papers
- [ ] Implement few-shot learning
- [ ] Read foundation model papers
- [ ] Contribute to open-source implementations
- [ ] Write summary/review of recent papers

## 🔗 Quick Links

- **Papers With Code**: https://paperswithcode.com/task/transfer-learning
- **Hugging Face**: https://huggingface.co/
- **PyTorch Tutorial**: https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html
- **Fast.ai Course**: https://course.fast.ai/
- **arXiv ML**: https://arxiv.org/list/cs.LG/recent

---

**Next Steps**: Start with survey papers, then move to classic papers. Implement code as you read to reinforce understanding.

