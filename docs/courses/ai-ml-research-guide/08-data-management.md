# Chapter 8: Data Collection & Management

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand data collection strategies</li>
    <li>Learn data preprocessing techniques</li>
    <li>Master data organization and storage</li>
    <li>Understand data versioning and documentation</li>
    <li>Learn about data ethics and privacy</li>
  </ul>
</div>

## Data in Research

Data is the **foundation** of ML research. Quality data is essential for:

- Valid experimental results
- Reproducible research
- Generalizable findings
- Credible publications

!!! note "Data Importance"
    "Garbage in, garbage out" - Poor data leads to poor results, regardless of model quality.

## Data Collection

### Sources of Data

**1. Public Datasets**:
- Academic datasets (ImageNet, COCO, etc.)
- Government data
- Open data initiatives
- Competition datasets

**2. Collected Data**:
- Surveys
- Experiments
- Observations
- Simulations

**3. Synthetic Data**:
- Generated data
- Augmented data
- Simulated environments

!!! tip "Dataset Selection"
    - Use standard benchmarks for comparison
    - Check data quality and size
    - Verify licensing and usage rights
    - Consider data diversity

### Dataset Evaluation

**Quality Checks**:
- **Completeness**: Missing values?
- **Accuracy**: Correct labels?
- **Consistency**: Format issues?
- **Relevance**: Appropriate for problem?
- **Size**: Sufficient for conclusions?

!!! warning "Data Quality"
    Always inspect data before use. Quality issues can invalidate results.

## Data Preprocessing

### Common Preprocessing Steps

**1. Cleaning**:
- Remove duplicates
- Handle missing values
- Fix errors
- Remove outliers (if appropriate)

**2. Normalization**:
- Standardization (z-score)
- Min-max scaling
- Unit normalization

**3. Transformation**:
- Feature engineering
- Encoding (one-hot, label)
- Dimensionality reduction

**4. Splitting**:
- Train/validation/test splits
- Stratification
- Time-based splits

!!! note "Preprocessing Order"
    - Split data FIRST
    - Then preprocess separately
    - Fit on training, transform all

### Preprocessing Best Practices

**1. Split Before Preprocessing**:
```python
# Correct order
train, val, test = split_data(data)
scaler = fit_scaler(train)  # Fit on train only
train_scaled = scaler.transform(train)
val_scaled = scaler.transform(val)
test_scaled = scaler.transform(test)
```

!!! warning "Data Leakage"
    Fitting preprocessing on full dataset leaks information. Always fit on training set only.

**2. Document Preprocessing**:
- Record all transformations
- Save preprocessing code
- Document parameters
- Version preprocessing pipeline

**3. Reproducibility**:
- Set random seeds
- Save preprocessing scripts
- Document versions
- Use version control

## Data Organization

### Directory Structure

**Recommended Structure**:
```
data/
├── raw/              # Original, unprocessed data
├── processed/        # Preprocessed data
├── splits/           # Train/val/test splits
├── metadata/         # Data documentation
└── scripts/          # Preprocessing scripts
```

!!! tip "Organization"
    - Keep raw data separate
    - Version processed data
    - Document everything
    - Use consistent naming

### Naming Conventions

**Best Practices**:
- Descriptive names
- Include version numbers
- Consistent format
- Avoid spaces/special chars

**Examples**:
- `coco_train_2017_v1.0.parquet`
- `imagenet_val_processed_v2.1.h5`
- `custom_dataset_v1.0_raw.zip`

## Data Storage

### Storage Formats

**Text Data**:
- CSV (small datasets)
- JSON (structured data)
- Parquet (efficient, large datasets)

**Image Data**:
- Individual files (JPG, PNG)
- HDF5 (efficient, large datasets)
- TFRecord (TensorFlow)
- LMDB (fast access)

**Tabular Data**:
- CSV (small)
- Parquet (large, efficient)
- HDF5 (hierarchical)

!!! note "Format Choice"
    Choose format based on:
    - Data size
    - Access patterns
    - Tool compatibility
    - Efficiency needs

### Storage Best Practices

**1. Version Control**:
- Use DVC (Data Version Control)
- Git LFS for small files
- Cloud storage with versioning

**2. Backup**:
- Multiple locations
- Regular backups
- Test restoration

**3. Access Control**:
- Permissions management
- Secure storage
- Audit logs

## Data Versioning

### Why Version Data?

**Benefits**:
- Reproducibility
- Track changes
- Rollback if needed
- Collaboration

### Versioning Tools

**DVC (Data Version Control)**:
- Git-like for data
- Efficient storage
- Reproducible pipelines
- Cloud integration

**Git LFS**:
- Large file support
- Git integration
- Version tracking

!!! tip "Data Versioning"
    Use DVC for data versioning. It's designed for ML workflows.

### Versioning Strategy

**Version Naming**:
- Semantic versioning (v1.0.0)
- Date-based (2024-01-15)
- Descriptive (v1.0.0-cleaned)

**Version Documentation**:
- Changelog
- What changed
- Why changed
- Who changed

## Data Documentation

### What to Document

**Dataset Information**:
- Source and origin
- Collection method
- Size and statistics
- License and usage

**Preprocessing**:
- Steps taken
- Parameters used
- Code/scripts
- Versions

**Splits**:
- Split strategy
- Split ratios
- Stratification info
- Random seeds

!!! success "Documentation"
    Good documentation enables reproducibility and collaboration.

### Documentation Format

**README.md for Dataset**:
```markdown
# Dataset Name

## Overview
Brief description

## Source
Where data came from

## Statistics
- Size: X samples
- Classes: Y
- Format: ...

## Preprocessing
Steps taken, parameters

## Splits
Train/val/test ratios, strategy

## Usage
How to load and use

## License
Usage rights
```

## Data Ethics and Privacy

### Ethical Considerations

**1. Consent**:
- Informed consent
- Clear purpose
- Right to withdraw

**2. Privacy**:
- Anonymization
- Data minimization
- Secure storage
- Access control

**3. Bias**:
- Check for bias
- Document limitations
- Fair representation
- Mitigation strategies

!!! warning "Ethics"
    Research ethics are critical. Always consider:
    - Privacy and consent
    - Bias and fairness
    - Data usage rights
    - Potential harm

### Privacy Protection

**Techniques**:
- **Anonymization**: Remove identifiers
- **Pseudonymization**: Replace identifiers
- **Differential Privacy**: Add noise
- **Federated Learning**: Keep data local

!!! note "Privacy"
    Protect participant privacy. Follow regulations (GDPR, etc.).

## Data Quality Assurance

### Quality Checks

**1. Validation**:
- Schema validation
- Range checks
- Format validation
- Completeness checks

**2. Statistics**:
- Distribution analysis
- Outlier detection
- Missing value analysis
- Correlation analysis

**3. Visualization**:
- Data distributions
- Sample inspection
- Quality plots
- Error analysis

!!! tip "Quality Checks"
    Always validate data quality. Automated checks catch issues early.

## Data Management Tools

### Data Versioning

**DVC**:
- Data version control
- Pipeline management
- Cloud storage integration

**Pachyderm**:
- Data versioning
- Pipeline automation
- Reproducibility

### Data Storage

**Cloud Storage**:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

**Local Storage**:
- Network attached storage
- Local drives
- External drives

### Data Processing

**Pandas**:
- Data manipulation
- Analysis
- Cleaning

**Dask**:
- Large dataset processing
- Parallel computing
- Distributed processing

## Resources

???+ "📚 Data Management"
    1. [Data Version Control (DVC)](https://dvc.org/) - DVC documentation
    2. [Data Management Guide](https://www.dataone.org/best-practices) - DataONE best practices
    3. [Research Data Management](https://www.ukdataservice.ac.uk/manage-data) - UK Data Service

???+ "🛠️ Tools"
    1. [DVC](https://dvc.org/) - Data version control
    2. [Pandas](https://pandas.pydata.org/) - Data manipulation
    3. [Dask](https://dask.org/) - Large data processing
    4. [Great Expectations](https://greatexpectations.io/) - Data validation

???+ "📊 Datasets"
    1. [Papers With Code Datasets](https://paperswithcode.com/datasets) - Dataset collection
    2. [Kaggle Datasets](https://www.kaggle.com/datasets) - Community datasets
    3. [UCI ML Repository](https://archive.ics.uci.edu/) - Classic datasets

## Next Steps

- [Chapter 9: Reproducing Research Papers](09-reproducing-papers.md) - Code reproduction
- [Chapter 10: Research Tools & Platforms](10-research-tools.md) - Essential tools

---

**Key Takeaways:**
- Data quality is critical for research validity
- Split data before preprocessing to avoid leakage
- Organize data systematically with clear structure
- Version data for reproducibility
- Document data thoroughly
- Consider ethics and privacy
- Validate data quality before use

