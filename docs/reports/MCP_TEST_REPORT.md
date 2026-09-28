# MCP Test Report
Generated: 2026-09-28T20:13:52.653Z

## Test Cases

- **[PASS]** Initialize Handshake 
- **[PASS]** Tools Listing (Found 44 tools)
- **[PASS]** Tool: search_agents 
- **[PASS]** Tool: search_agents fuzzy equivalency 
- **[PASS]** Tool: recommend_agents 
- **[PASS]** Tool: recommend_agents array safe 
- **[PASS]** Expected Full Stack agents present (Returned: Next.js Performance Engineer, MERN Architect, Database Engineer, Backend Architect)
- **[PASS]** Tool: career_assessment 
- **[PASS]** Tool: resume_score 
- **[PASS]** Tool: job_match 
- **[PASS]** Tool: company_track 
- **[PASS]** Tool: career_path 
- **[PASS]** Tool: workflow_lookup 
- **[PASS]** Tool: agent_details 
- **[PASS]** Tool: knowledge_graph 
- **[PASS]** Tool: knowledge_graph path traversal 
- **[PASS]** Tool: knowledge_graph workflows query 
- **[PASS]** Tool: knowledge_graph companies query 
- **[PASS]** Tool: knowledge_graph career path for Configuration Management (paths: ["DevOps Engineer"])
- **[PASS]** Tool: knowledge_graph career path for Prioritization Frameworks (paths: ["Product Manager"])
- **[PASS]** Resources Listing 
- **[PASS]** Resources Read 
- **[PASS]** Error Handling: Invalid Tool Name 
- **[PASS]** Security: Traversal Safeguard Block 
- **[PASS]** Tool: career_gap_analysis 
- **[PASS]** Tool: generate_resume_docx 
- **[PASS]** Tool: generate_interview_prep_pdf 
- **[PASS]** Tool: generate_career_roadmap_xlsx 
- **[PASS]** Tool: search_jobs 
- **[PASS]** Tool: career_pipeline_track add keeps existing fields ({"company":"Northwind","role":"Platform Engineer","status":"interviewing","appliedDate":"2026-01-15","fitScore":null,"link":"https://example.com/jobs/42","notes":"Referral from former teammate"})
- **[PASS]** Tool: career_pipeline_track add stores notes ({"company":"Contoso","role":"SRE","status":"applied","appliedDate":"2026-09-28","fitScore":null,"link":"-","notes":"Found via alumni network"})
- **[PASS]** Tool: career_pipeline_track status updates only the given role ([{"company":"Northwind","role":"Platform Engineer","status":"interviewing","appliedDate":"2026-01-15","fitScore":null,"link":"https://example.com/jobs/42","notes":"Referral from former teammate"},{"company":"Northwind","role":"Data Engineer","status":"offer","appliedDate":"2026-09-28","fitScore":null,"link":"-","notes":"Offer received"}])
- **[PASS]** Tool: analyze_job_posting 
- **[PASS]** Tool: analyze_github_profile 
- **[PASS]** Tool: linkedin_profile_review 
- **[PASS]** Tool: career_action_plan 
- **[PASS]** Tool: search_memory (Matches: ats-resume-reviewer, executive-job-search-coach, resume-strategist, executive-resume-advisor, resume-achievement-writer)
- **[PASS]** Tool: search_knowledge_base (Matches: ats-resume-reviewer, executive-job-search-coach, resume-strategist, executive-resume-advisor, resume-achievement-writer)
- **[PASS]** Tool: company_dossier 
- **[PASS]** Tool: company_dossier unknown company fallback 
- **[PASS]** Tool: interview_plan 
- **[PASS]** Tool: interview_plan without company 
- **[PASS]** Tool: github_push_file token boundary (Execution error: GitHub token missing. Set GITHUB_TOKEN environment variable to execute direct repository commits.)
- **[PASS]** Tool: github_sync_portfolio token boundary (Execution error: GitHub token missing. Set GITHUB_TOKEN environment variable to sync portfolio.)
- **[PASS]** Tool: generate_star_bank 
- **[PASS]** Tool: resume_keyword_heatmap 

## Summary
- **Total tests**: 46
- **Passed tests**: 46
- **Failed tests**: 0