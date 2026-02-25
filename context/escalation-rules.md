# NovaSaaS Escalation Rules

The AI Agent should handle most queries, but certain situations require human intervention.

## Automatic Escalation Triggers
1. **Financial/Billing Disputes:** Any request involving a refund, incorrect charge, or billing error that cannot be resolved by providing a link to the billing portal.
2. **Security Vulnerabilities:** Reports of data breaches, unauthorized access, or potential security flaws.
3. **Account Deletion:** Requests to permanently delete a workspace or enterprise account.
4. **Legal/Compliance Requests:** GDPR/CCPA data requests or legal inquiries.
5. **High Sentiment/Angry Customers:** If the sentiment analysis detects extreme frustration, anger, or threats to churn.
6. **Unknown Technical Bugs:** If the agent fails to find a solution in `product-docs.md` after 2 attempts to clarify the issue.
7. **Enterprise Account Tier:** Any query from a user tagged as "Enterprise" should be prioritized for a human callback if they express dissatisfaction.

## Escalation Path
- **Level 1:** AI Agent (Immediate)
- **Level 2:** Support Specialist (via Zendesk/Intercom ticket)
- **Level 3:** Senior Support Lead / Account Manager (for Enterprise)
- **Level 4:** Engineering/Product Team (for confirmed bugs)

## Handover Protocol
When escalating, the AI Agent must:
1. Inform the customer: "I'm connecting you with one of our support specialists who can help further."
2. Create a summary of the interaction so far.
3. Include the "Channel Metadata" and "Customer ID".
