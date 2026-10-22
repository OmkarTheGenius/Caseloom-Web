Caseloom — Digital Commerce & UX Heatmap Lab
MBA Digital Commerce CIA 3 project — ATLAS SkillTech University, ISME
- Live storefront: https://omkarthegenius.github.io/Caseloom-Web/
- Source repository: https://github.com/OmkarTheGenius/Caseloom-Web
- Project type: Responsive concept storefront + local-first usability-test prototype
What this project demonstrates
- A responsive single-page concept storefront for six illustrative custom phone-case designs.
- A visual customizer for selecting a design, base colour, name/initials, phone-model option and illustrative price tier.
- SEO-oriented page title, meta description, canonical URL, Open Graph/Twitter metadata and FAQ JSON-LD structured data.
- Crawler/discovery support files in the repository: robots.txt, sitemap.xml, and experimental llms.txt.
- An opt-in client-side interaction recorder (heatmap.js) and a separate import dashboard in the project evidence package.
Important status and limitations
Caseloom is a student project concept, not an operational online shop.
- There is no checkout, payment collection, order fulfilment, or real email sign-up capture.
- Prices ₹499/₹699/₹799 are planning assumptions and have not been confirmed with a print partner.
- Phone-model selection does not validate the shape, fit, or camera cut-outs for a real device.
- Custom-art upload is not implemented.
- No production analytics property, verified sales, production traffic, conversions or campaign reach are claimed.
- A Google Business Profile has not been created. Google requires eligible businesses to make in-person contact with customers during stated hours; the current concept does not qualify.
- llms.txt is experimental. Its presence does not guarantee indexing, AI citations, ranking or GEO visibility.
How to use the opt-in heatmap recorder
1. Open the published storefront with ?heatmap=1 appended to the URL, for example: https://omkarthegenius.github.io/Caseloom-Web/?heatmap=1.
2. The tester must explicitly start a test session in the on-page panel.
3. Interact with the page, then stop and export the session JSON.
4. Import the JSON into heatmap-dashboard.html (available in the full project package, not currently hosted at the website root).
5. Optionally upload a full-page screenshot of the same page version and viewport to align the hotspot overlay.
Privacy and data handling
The recorder stores test data locally in the browser until exported or cleared. It does not send data to a server. It does not capture typed values or form submissions. Ask for consent, never enter real personal details, and inspect JSON exports before sharing. Browser local storage is device-specific, so sessions must be exported and imported manually to combine results.
Pilot result included in the CIA 3 deck
The current analysis represents one internal desktop walkthrough (n=1), around 110 seconds. A first-recorder attribution issue meant 31 wrapper/label clicks were excluded from the 42 raw click events; 11 actionable anchor/button clicks were retained. This is a technical demonstration, not representative user research and not customer analytics. The launch CTA click is not a sign-up because the form does not store data.
Synthetic feedback dataset
A separate practice workbook contains 15 AI-generated response records for learning spreadsheet analysis. No people submitted those responses. They must be labelled synthetic and must not be reported as survey results or campaign results. The synthetic dataset is not included in this public repository by default.
SEO files
These files are stored at the repository root:
- robots.txt
- sitemap.xml
- llms.txt
For a project site, the expected live paths are:
- https://omkarthegenius.github.io/Caseloom-Web/robots.txt
- https://omkarthegenius.github.io/Caseloom-Web/sitemap.xml
- https://omkarthegenius.github.io/Caseloom-Web/llms.txt
Check the URLs directly in a browser and confirm they serve their contents before stating that the live endpoints have been verified. Their presence in source control alone does not prove successful crawling or indexing. Google Search Console has not been configured and no indexing result is claimed.
Team
- Rishika Thakur
- Leon D'Silva
- Shreyas Sawant
- Omkar Gurav
Assignment evidence status
The analytics prototype and one-session pilot are treated as completed for the academic demonstration. The scope remains a usability-test prototype; it is not production customer analytics.
Deliverable	Current status	Evidence / limitation
Storefront / landing page	Implemented and published	Live GitHub Pages link above; no ordering/payment
SEO and GEO	Partially implemented	Metadata + FAQ schema in source; verify served crawler-file URLs; no rankings/indexing claimed
Social content and calendar	Prepared, not published	Three creative concepts and a four-week calendar in presentation; no Instagram account/posts yet
Campaign and multichannel outreach	Not executed yet	No verified WhatsApp/email/social campaign reach or campaign response data
Analytics dashboard/reporting	Completed as a working academic prototype	One internal UX pilot (n=1); click/scroll data demonstrates the tool, not customer analytics or conversions
Google Business Profile/local SEO	Profile correctly not created at this stage	Concept is not currently eligible; future eligibility depends on actual in-person operations
Results/recommendations	Prepared with caveats	Distinguishes actual pilot evidence from synthetic practice data


Sources / policy references
- GitHub Pages documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Google Business Profile eligibility: https://support.google.com/business/answer/13763036
