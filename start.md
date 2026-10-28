# PRD Information Collection Prompt
Use this prompt with any AI assistant to collect structured information needed to create a comprehensive Product Requirements Document. Copy the entire prompt below and paste it into your conversation with the AI.
---
I'm creating a Product Requirements Document (PRD) for a new product. Please help me collect all the necessary information by asking me questions in a structured way. Walk me through the following sections one by one, asking 3-5 targeted questions for each section to extract specific details I should include in my PRD. After each section, summarize what you've learned before moving to the next section.
## Product Basics
Ask me about:
- What the product is and does at a high level
- The main problem it solves
- Who the target users are
- The key value proposition
## User Personas
Ask me about:
- The primary user types (2-3 personas)
- Their goals, challenges, and needs
- How they would interact with the product
- What success looks like for each persona
## Core Features
For each feature I mention:
- Ask me to describe it in detail
- Ask how it benefits the user
- Ask about specific functionality requirements
- Ask about priority level (must-have vs. nice-to-have)
- Ask about acceptance criteria
## User Experience
Ask me about:
- Key user journeys and flows
- UI/UX considerations and requirements
- Design principles or constraints
- Any specific usability requirements
## Technical Architecture
Ask me about:
- System components and infrastructure
- Data models and storage requirements
- APIs and integrations needed
- Technical constraints or requirements
## Development Approach
Ask me about:
- POC phase: which feature to build first and why
- MVP requirements: minimum feature set
- Future phases: enhancement priorities
- Logical dependencies between features
## Risks and Challenges
Ask me about:
- Potential technical challenges
- Market or user adoption risks
- Resource or implementation constraints
- Mitigation strategies
## Additional Information
Ask if there's any other relevant information I want to include, such as:
- Research findings
- Competitive analysis
- Technical specifications
- Future considerations
## Final Summary
After gathering all information, provide a comprehensive summary of what you've learned about the product, highlighting key points from each section that should be emphasized in the PRD.
## Update Files
### Update PRD File
After collecting all this information, please update the file "prd.md" in the root folder. This file already contains the structure to use - do not change the structure. Instead, fill in the relevant sections with the detailed information gathered from our conversation.
Remember that the PRD is the source of truth for project requirements, so be thorough and precise when updating it. If any information we discussed would affect existing codebase requirements, make sure to note this explicitly in the appropriate sections.
### Update Tasks List
Additionally, update the file "tasks.md" in the root folder with a prioritized list of actionable tasks derived from the PRD. Follow these specific formatting rules:
1. Use markdown checkboxes:
   - `- [ ]` for pending tasks
   - `- [x]` for completed tasks (likely none at this stage)
2. Organize tasks under appropriate version sections:
   ```markdown
   ## POC Phase
   - [ ] Task 1
     - [ ] Subtask 1.1
     - [ ] Subtask 1.2
   
   ## MVP Phase
   - [ ] Task 2
   ```
3. For each task:
   - Write a clear, specific task title
   - Break complex features into subtasks
   - Include which section/feature of the PRD it relates to
   - Add a brief description of what needs to be done
   - Note any dependencies on other tasks
4. Organize tasks by development phase (POC, MVP, etc.) and then by priority within each phase.
---
Note: Feel free to modify questions based on my answers and go deeper where necessary. If I've already provided information, don't ask redundant questions. Try to be conversational while still extracting structured information.