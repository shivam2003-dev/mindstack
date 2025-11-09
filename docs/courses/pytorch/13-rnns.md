# Chapter 13: Recurrent Neural Networks (RNNs)

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔄 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand RNN architecture and concepts</li>
    <li>Master LSTM and GRU implementations</li>
    <li>Build sequence-to-sequence models</li>
    <li>Handle variable-length sequences</li>
  </ul>
</div>

RNNs are designed for sequential data like text, time series, and audio. This chapter covers vanilla RNNs, LSTMs, and GRUs.

!!! note "When to Use RNNs"
    RNNs are great for sequential data: text, time series, speech. However, for many NLP tasks, Transformers have largely replaced RNNs. Use RNNs when you need to process sequences step-by-step or when memory efficiency is important.

!!! tip "LSTM vs GRU"
    - **LSTM**: More parameters, better for long sequences, slower training
    - **GRU**: Fewer parameters, faster training, often similar performance
    - **Vanilla RNN**: Simple but suffers from vanishing gradients - rarely used in practice

## Basics of RNNs

### Simple RNN

```python
import torch
import torch.nn as nn

# Single RNN cell
rnn_cell = nn.RNNCell(input_size=10, hidden_size=20)

# Input: (batch, input_size)
input = torch.randn(32, 10)
hidden = torch.zeros(32, 20)

# Forward pass
new_hidden = rnn_cell(input, hidden)
print(new_hidden.shape)  # torch.Size([32, 20])

# Multi-layer RNN
rnn = nn.RNN(input_size=10, hidden_size=20, num_layers=2, batch_first=True)

# Input: (batch, seq_len, input_size)
input_seq = torch.randn(32, 100, 10)
output, hidden = rnn(input_seq)

print(output.shape)   # torch.Size([32, 100, 20])
print(hidden.shape)   # torch.Size([2, 32, 20])  # (num_layers, batch, hidden)
```

## LSTM (Long Short-Term Memory)

### LSTM Basics

```python
import torch
import torch.nn as nn

# LSTM layer
lstm = nn.LSTM(input_size=10, hidden_size=20, num_layers=2, batch_first=True)

# Input
input_seq = torch.randn(32, 100, 10)  # (batch, seq_len, features)

# Initial states
h0 = torch.zeros(2, 32, 20)  # (num_layers, batch, hidden)
c0 = torch.zeros(2, 32, 20)  # (num_layers, batch, hidden)

# Forward
output, (hn, cn) = lstm(input_seq, (h0, c0))

print(output.shape)  # torch.Size([32, 100, 20])  # All hidden states
print(hn.shape)      # torch.Size([2, 32, 20])    # Final hidden state
print(cn.shape)      # torch.Size([2, 32, 20])    # Final cell state
```

### LSTM for Text Classification

```python
class LSTMClassifier(nn.Module):
    """LSTM for text classification"""
    
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_classes, num_layers=1):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.3 if num_layers > 1 else 0
        )
        self.fc = nn.Linear(hidden_dim, num_classes)
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        # x: (batch, seq_len)
        
        # Embedding
        embedded = self.embedding(x)  # (batch, seq_len, embedding_dim)
        
        # LSTM
        output, (hidden, cell) = self.lstm(embedded)
        
        # Use last hidden state
        hidden = hidden[-1]  # (batch, hidden_dim)
        
        # Classifier
        hidden = self.dropout(hidden)
        logits = self.fc(hidden)
        
        return logits

# Usage
vocab_size = 10000
model = LSTMClassifier(vocab_size=vocab_size, embedding_dim=100, hidden_dim=256, num_classes=5)

# Dummy input
text = torch.randint(0, vocab_size, (32, 50))  # (batch=32, seq_len=50)
output = model(text)
print(output.shape)  # torch.Size([32, 5])
```

### Bidirectional LSTM

```python
class BiLSTMClassifier(nn.Module):
    """Bidirectional LSTM for better context"""
    
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_classes):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        
        # Bidirectional LSTM
        self.lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
            bidirectional=True
        )
        
        # *2 because bidirectional
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        embedded = self.embedding(x)
        
        # BiLSTM output
        output, (hidden, cell) = self.lstm(embedded)
        
        # Concatenate forward and backward hidden states
        # hidden: (num_layers*2, batch, hidden_dim)
        hidden_fwd = hidden[-2]
        hidden_bwd = hidden[-1]
        hidden = torch.cat([hidden_fwd, hidden_bwd], dim=1)
        
        hidden = self.dropout(hidden)
        logits = self.fc(hidden)
        
        return logits
```

## GRU (Gated Recurrent Unit)

### GRU Basics

```python
# GRU is simpler than LSTM (no cell state)
gru = nn.GRU(input_size=10, hidden_size=20, num_layers=2, batch_first=True)

input_seq = torch.randn(32, 100, 10)
output, hidden = gru(input_seq)

print(output.shape)   # torch.Size([32, 100, 20])
print(hidden.shape)   # torch.Size([2, 32, 20])
```

### GRU Classifier

```python
class GRUClassifier(nn.Module):
    """GRU for sequence classification"""
    
    def __init__(self, input_dim, hidden_dim, num_classes, num_layers=2):
        super().__init__()
        
        self.gru = nn.GRU(
            input_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.3 if num_layers > 1 else 0
        )
        self.fc = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        output, hidden = self.gru(x)
        
        # Use last hidden state
        hidden = hidden[-1]
        
        logits = self.fc(hidden)
        return logits
```

## Sequence-to-Sequence Models

### Encoder-Decoder Architecture

```python
class Encoder(nn.Module):
    """Encoder for seq2seq"""
    
    def __init__(self, input_dim, embedding_dim, hidden_dim, num_layers):
        super().__init__()
        
        self.embedding = nn.Embedding(input_dim, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers, batch_first=True)
    
    def forward(self, src):
        # src: (batch, src_len)
        embedded = self.embedding(src)
        
        output, (hidden, cell) = self.lstm(embedded)
        
        return hidden, cell

class Decoder(nn.Module):
    """Decoder for seq2seq"""
    
    def __init__(self, output_dim, embedding_dim, hidden_dim, num_layers):
        super().__init__()
        
        self.embedding = nn.Embedding(output_dim, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)
    
    def forward(self, input, hidden, cell):
        # input: (batch, 1)
        embedded = self.embedding(input)
        
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        
        prediction = self.fc(output.squeeze(1))
        
        return prediction, hidden, cell

class Seq2Seq(nn.Module):
    """Complete Seq2Seq model"""
    
    def __init__(self, encoder, decoder):
        super().__init__()
        
        self.encoder = encoder
        self.decoder = decoder
    
    def forward(self, src, trg, teacher_forcing_ratio=0.5):
        # src: (batch, src_len)
        # trg: (batch, trg_len)
        
        batch_size = src.size(0)
        trg_len = trg.size(1)
        trg_vocab_size = self.decoder.fc.out_features
        
        # Store decoder outputs
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size).to(src.device)
        
        # Encode
        hidden, cell = self.encoder(src)
        
        # First input to decoder is <sos> token
        input = trg[:, 0].unsqueeze(1)
        
        for t in range(1, trg_len):
            # Decode
            output, hidden, cell = self.decoder(input, hidden, cell)
            
            outputs[:, t] = output
            
            # Teacher forcing
            teacher_force = torch.rand(1).item() < teacher_forcing_ratio
            top1 = output.argmax(1).unsqueeze(1)
            input = trg[:, t].unsqueeze(1) if teacher_force else top1
        
        return outputs

# Usage
INPUT_DIM = 10000
OUTPUT_DIM = 8000
ENC_EMB_DIM = 256
DEC_EMB_DIM = 256
HID_DIM = 512
N_LAYERS = 2

encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM, N_LAYERS)
decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM, N_LAYERS)
model = Seq2Seq(encoder, decoder)
```

## Attention Mechanism

### Simple Attention

```python
class Attention(nn.Module):
    """Simple attention mechanism"""
    
    def __init__(self, hidden_dim):
        super().__init__()
        
        self.attn = nn.Linear(hidden_dim * 2, hidden_dim)
        self.v = nn.Linear(hidden_dim, 1, bias=False)
    
    def forward(self, hidden, encoder_outputs):
        # hidden: (batch, hidden_dim)
        # encoder_outputs: (batch, src_len, hidden_dim)
        
        batch_size = encoder_outputs.size(0)
        src_len = encoder_outputs.size(1)
        
        # Repeat hidden state src_len times
        hidden = hidden.unsqueeze(1).repeat(1, src_len, 1)
        
        # Concatenate
        energy = torch.tanh(self.attn(torch.cat([hidden, encoder_outputs], dim=2)))
        
        # Calculate attention scores
        attention = self.v(energy).squeeze(2)
        
        # Softmax
        return torch.softmax(attention, dim=1)

class AttentionDecoder(nn.Module):
    """Decoder with attention"""
    
    def __init__(self, output_dim, embedding_dim, hidden_dim, num_layers):
        super().__init__()
        
        self.embedding = nn.Embedding(output_dim, embedding_dim)
        self.attention = Attention(hidden_dim)
        self.lstm = nn.LSTM(embedding_dim + hidden_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)
    
    def forward(self, input, hidden, cell, encoder_outputs):
        # input: (batch, 1)
        embedded = self.embedding(input)
        
        # Calculate attention weights
        a = self.attention(hidden[-1], encoder_outputs)
        
        # Apply attention to encoder outputs
        a = a.unsqueeze(1)  # (batch, 1, src_len)
        weighted = torch.bmm(a, encoder_outputs)  # (batch, 1, hidden_dim)
        
        # Concatenate embedded input and weighted encoder outputs
        lstm_input = torch.cat([embedded, weighted], dim=2)
        
        output, (hidden, cell) = self.lstm(lstm_input, (hidden, cell))
        
        prediction = self.fc(output.squeeze(1))
        
        return prediction, hidden, cell
```

## Time Series Forecasting

### LSTM for Time Series

```python
class LSTMForecaster(nn.Module):
    """LSTM for time series forecasting"""
    
    def __init__(self, input_dim, hidden_dim, num_layers, output_dim):
        super().__init__()
        
        self.lstm = nn.LSTM(
            input_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.2 if num_layers > 1 else 0
        )
        self.fc = nn.Linear(hidden_dim, output_dim)
    
    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Use last output
        last_output = lstm_out[:, -1, :]
        
        prediction = self.fc(last_output)
        
        return prediction

# Training function
def train_forecaster(model, train_loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    
    for sequences, targets in train_loader:
        sequences = sequences.to(device)
        targets = targets.to(device)
        
        optimizer.zero_grad()
        
        predictions = model(sequences)
        loss = criterion(predictions, targets)
        
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    return total_loss / len(train_loader)

# Usage
model = LSTMForecaster(input_dim=10, hidden_dim=64, num_layers=2, output_dim=1)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
```

## Packed Sequences (Variable Length)

### Handling Variable-Length Sequences

```python
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

class PackedLSTM(nn.Module):
    """LSTM with packed sequences for efficiency"""
    
    def __init__(self, vocab_size, embedding_dim, hidden_dim, num_classes):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x, lengths):
        # x: (batch, max_seq_len)
        # lengths: actual lengths of sequences
        
        embedded = self.embedding(x)
        
        # Pack padded sequences
        packed = pack_padded_sequence(
            embedded,
            lengths.cpu(),
            batch_first=True,
            enforce_sorted=False
        )
        
        # LSTM on packed sequence
        packed_output, (hidden, cell) = self.lstm(packed)
        
        # Unpack
        output, _ = pad_packed_sequence(packed_output, batch_first=True)
        
        # Use last hidden state
        logits = self.fc(hidden[-1])
        
        return logits

# Custom collate function
from torch.nn.utils.rnn import pad_sequence

def collate_variable_length(batch):
    """Collate function for variable-length sequences"""
    sequences, labels = zip(*batch)
    
    # Get lengths
    lengths = torch.tensor([len(seq) for seq in sequences])
    
    # Pad sequences
    padded_sequences = pad_sequence(sequences, batch_first=True, padding_value=0)
    labels = torch.tensor(labels)
    
    return padded_sequences, labels, lengths

# DataLoader
dataloader = DataLoader(
    dataset,
    batch_size=32,
    collate_fn=collate_variable_length
)
```

## Best Practices

### Gradient Clipping

```python
# Prevent exploding gradients
max_grad_norm = 1.0

for epoch in range(num_epochs):
    for batch in dataloader:
        optimizer.zero_grad()
        
        output = model(batch)
        loss = criterion(output, targets)
        
        loss.backward()
        
        # Clip gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
        
        optimizer.step()
```

### Layer Normalization

```python
class LSTMWithLayerNorm(nn.Module):
    """LSTM with layer normalization for stability"""
    
    def __init__(self, input_dim, hidden_dim, num_layers):
        super().__init__()
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.layer_norm = nn.LayerNorm(hidden_dim)
    
    def forward(self, x):
        output, (hidden, cell) = self.lstm(x)
        
        # Apply layer norm
        output = self.layer_norm(output)
        
        return output, (hidden, cell)
```

## Complete Example: Sentiment Analysis

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class SentimentDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_length=100):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        # Convert to indices
        indices = [self.vocab.get(word, self.vocab['<UNK>']) 
                   for word in text.split()[:self.max_length]]
        
        return torch.tensor(indices), label

class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim=100, hidden_dim=256, num_layers=2):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=0.5,
            bidirectional=True
        )
        self.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(hidden_dim * 2, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x, lengths):
        embedded = self.embedding(x)
        
        # Pack sequences
        packed = pack_padded_sequence(
            embedded, lengths.cpu(), batch_first=True, enforce_sorted=False
        )
        
        packed_output, (hidden, cell) = self.lstm(packed)
        
        # Concatenate final forward and backward hidden states
        hidden = torch.cat([hidden[-2], hidden[-1]], dim=1)
        
        output = self.fc(hidden).squeeze(1)
        
        return output

# Training
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = SentimentLSTM(vocab_size=10000).to(device)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    model.train()
    for texts, labels, lengths in train_loader:
        texts, labels = texts.to(device), labels.to(device)
        
        optimizer.zero_grad()
        
        outputs = model(texts, lengths)
        loss = criterion(outputs, labels.float())
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
```

## Next Steps

Continue to [Chapter 14: Transfer Learning](14-transfer-learning.md) for:
- Using pretrained models
- Fine-tuning strategies
- Feature extraction

## Key Takeaways

- ✅ LSTMs solve vanishing gradient problem
- ✅ GRUs are simpler but often comparable
- ✅ Use bidirectional RNNs for better context
- ✅ Packed sequences improve efficiency
- ✅ Always clip gradients for RNNs
- ✅ Attention mechanism improves long sequences
- ✅ Teacher forcing speeds up training

## Recommended Reads

???+ "📚 Official Documentation"
    1. [RNN](https://pytorch.org/docs/stable/generated/torch.nn.RNN.html) - RNN layer documentation
    2. [LSTM](https://pytorch.org/docs/stable/generated/torch.nn.LSTM.html) - LSTM layer documentation
    3. [GRU](https://pytorch.org/docs/stable/generated/torch.nn.GRU.html) - GRU layer documentation
    4. [Packed Sequences](https://pytorch.org/docs/stable/generated/torch.nn.utils.rnn.pack_padded_sequence.html) - Handling variable-length sequences

???+ "📖 Essential Articles"
    1. [RNN Tutorial](https://pytorch.org/tutorials/intermediate/char_rnn_classification_tutorial.html) - Building RNNs
    2. [LSTM for Time Series](https://pytorch.org/tutorials/beginner/nlp/sequence_models_tutorial.html) - Time series forecasting
    3. [Sequence-to-Sequence Models](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html) - Seq2Seq tutorial
    4. [Attention Mechanisms](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html) - Attention in RNNs

???+ "🎓 Learning Resources"
    1. [NLP with PyTorch](https://pytorch.org/tutorials/beginner/nlp/deep_learning_tutorial.html) - NLP tutorial
    2. [RNN Best Practices](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Training tips
    3. [Gradient Clipping](https://pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html) - Preventing gradient explosion

???+ "💡 Best Practices"
    1. [Handling Variable-Length Sequences](https://pytorch.org/docs/stable/generated/torch.nn.utils.rnn.pack_padded_sequence.html) - Packed sequences
    2. [Teacher Forcing](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html) - Training strategies
    3. [Bidirectional RNNs](https://pytorch.org/docs/stable/generated/torch.nn.RNN.html) - Bidirectional processing

???+ "🔬 Research Papers"
    1. [Long Short-Term Memory](https://www.bioinf.jku.at/publications/older/2604.pdf) - LSTM paper
    2. [Learning Phrase Representations using RNN Encoder-Decoder](https://arxiv.org/abs/1406.1078) - GRU paper
    3. [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - Transformer architecture

---
