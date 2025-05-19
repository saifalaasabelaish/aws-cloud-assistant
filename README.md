# AWS Cloud Assistant 🤖

![AWS Amplify](https://img.shields.io/badge/AWS_Amplify-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Amazon Lex](https://img.shields.io/badge/Amazon_Lex-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)

## 📌 Project Overview

The **AWS Cloud Assistant** is an intelligent chatbot interface that enables natural language interaction with AWS services. Built with React and powered by AWS Amplify, Amazon Lex, and AppSync, this solution provides:

- Conversational cloud management
- Secure authentication via AWS Cognito
- Real-time data synchronization
- Cloud resource querying via natural language

## 👥 Team Members

| Role | Name |
|------|------|
| **ChatBot developer** | Saif Sabelaish |
| **Backend developer** | Data Abdelhaqq |
| **Backend developer** | Tareq Saymeh |
| **Frontend developer ** | Roaa Kittaneh |

## 🎥 Demo Video
[![Watch Demo](https://img.shields.io/badge/Watch-Demo-blue?style=for-the-badge)](https://drive.google.com/file/d/1uBwJec8nIYdrihbrcl-5nmjWHOdAzMQr/view?usp=sharing)

## 🏗️ Project Structure

```plaintext
my-app/
├── amplify/                  # AWS Amplify configurations
├── src/
│   ├── components/
│   │   └── Chat.js           # Main chat interface
│   ├── graphql/
│   │   ├── mutations.js      # Data modification operations
│   │   ├── queries.js        # Data fetching operations
│   │   └── subscriptions.js  # Real-time updates
│   └── pages/                # Auth flows
│       ├── Login.js
│       └── Signup.js
└── aws-exports.js            # AWS service endpoints
```

## ✨ Key Features
Natural Language Processing: Powered by Amazon Lex

Real-time Chat: GraphQL subscriptions for instant updates

Secure Authentication: AWS Cognito integration

Cloud Management: Query AWS resources conversationally

Responsive UI: Material-UI components with custom styling

## 🚀 Getting Started
Prerequisites
Node.js v16+

AWS account with Amplify access

AWS CLI configured

## Installation
Clone the repository:

```bash
git clone https://github.com/your-repo/aws-cloud-assistant.git
```

Install dependencies:

```bash
cd my-app
npm install
```

Configure Amplify:

```bash
amplify init
```
Run the development server:

```bash
npm start
```
## 🌐 Deployment
Deploy to AWS Amplify Hosting:

```bash
amplify publish
```

🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📧 Contact
For questions or support, please contact the development team.
