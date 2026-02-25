# NovaSaaS Edge Case Documentation

This document outlines the specific handling for 10+ edge cases identified during the development of the Customer Success AI Agent.

| ID | Edge Case | Expected AI Behavior | Mitigation Logic |
|---|---|---|---|
| EC-01 | **Pricing/Refund Requests** | Refuse to discuss numbers. | Automatic escalation via `escalate_to_human`. |
| EC-02 | **GDPR/Data Deletion** | Acknowledge request. | Escalate to "Legal/Compliance" category. |
| EC-03 | **Profanity/Abuse** | Remain professional. | Immediate escalation + sentiment flag. |
| EC-04 | **Duplicate Tickets** | Identify existing conversation. | `get_or_create_conversation` uses 24h window. |
| EC-05 | **Unsupported File Types** | Inform user we only accept images/PDFs. | Channel handler filtering. |
| EC-06 | **WhatsApp Character Limit** | Truncate or split message. | `format_response` splits at 1600/300 chars. |
| EC-07 | **Non-English Queries** | Respond in same language if possible. | LLM multi-lingual capability. |
| EC-08 | **Security Breach Report** | Urgent priority. | High-priority flag + Engineering escalation. |
| EC-09 | **Churn Threat** | High empathy. | Escalate to "Account Manager". |
| EC-10 | **Vague/Empty Message** | Ask for clarification. | Agent fallback response. |
| EC-11 | **Simultaneous Multi-Channel** | Link via email/phone. | `customer_identifiers` cross-matching. |
| EC-12 | **Out-of-Office Replies** | Ignore. | Metadata filtering (ignore 'Auto-submitted' headers). |
| EC-13 | **System Outage Query** | Provide status page link. | KB lookup for "Status Page". |
