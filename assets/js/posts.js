/* =========================================================
   RésuméKlinik — INSIGHTS / PUBLICATIONS
   ---------------------------------------------------------
   Every LinkedIn post or article you want on the website goes
   here. Newest posts can go anywhere: the site sorts by date.

   HOW TO ADD A LINKEDIN POST (2 minutes)
   1. On LinkedIn, open the post, click "...", then "Copy link to post".
   2. Copy the post text.
   3. Copy one { ... } block below, paste it at the top of the list,
      and fill it in. Keep the quotes and the comma after the block.

   FIELDS
   author      "founder"  = your personal posts
               "company"  = RésuméKlinik company page posts
   slug        short unique name, lowercase-with-hyphens (used in the link)
   title       headline shown on the card
   date        "YYYY-MM-DD"
   topic       one of the topic labels, e.g. "Future of work & HR"
   image       optional picture in assets/media/insights/ e.g. "ats.jpg"
               (16:9, 1600 x 900 px). Leave "" for a designed cover.
   linkedin    link to the original post ("" if none)
   embed       optional LinkedIn embed link (post "..." > "Embed this post",
               copy only the https://www.linkedin.com/embed/... part)
   body        the full text. Use `backticks` around it so line breaks work.
               Blank line = new paragraph. Lines starting "- " = bullets.
               Lines starting "## " = sub-heading.

   Topic labels used for Mayowa's posts:
   Policy & governance · Business & strategy · Future of work & HR ·
   Tech, data & infosec · Reality check · Consulting frameworks
   ========================================================= */

window.RK_POSTS = [

  /* ---- TEMPLATE: copy this block for each of your LinkedIn posts ----
  {
    author: "founder",
    slug: "my-post-title",
    title: "Your post headline",
    date: "2026-10-01",
    topic: "Future of work & HR",
    image: "",
    linkedin: "https://www.linkedin.com/posts/...",
    embed: "",
    body: `First paragraph of your post.

Second paragraph.

- A bullet point
- Another bullet point`
  },
  ---------------------------------------------------------------- */

  {
    author: "company",
    slug: "what-an-ats-actually-reads",
    title: "What an ATS actually reads in your CV",
    date: "2026-09-18",
    topic: "CV tips",
    image: "",
    linkedin: "",
    embed: "",
    body: `Many employers store and screen applications in an applicant tracking system (ATS). Before a recruiter ever opens your CV, the software has to read it correctly, pull out your details and match them to the role.

Most rejections at this stage are not about talent. They are about formatting the software cannot read, or language that does not match the job.

## What gets lost

- Tables, text boxes and two-column layouts, which can scramble the reading order
- Headers and footers, where contact details are sometimes skipped
- Icons and graphics in place of words, such as a phone symbol instead of "Phone"
- Unusual section names like "My Journey" instead of "Work Experience"

## What gets read well

- A single-column layout with standard headings
- A plain, widely available font
- Job titles, skills and tools written the way the job advert writes them
- Dates in a consistent format

## A quick test

Copy everything in your CV and paste it into a plain text document. If the order is jumbled or details are missing, an ATS may see the same mess.

Want us to check yours? Take the free CV check-up or send your CV on WhatsApp.`
  },

  {
    author: "company",
    slug: "duties-versus-results",
    title: "Duties versus results: one bullet, rewritten",
    date: "2026-09-04",
    topic: "CV tips",
    image: "",
    linkedin: "",
    embed: "",
    body: `The most common problem we see in CVs is not spelling or design. It is bullet points that describe the job instead of the person doing it.

"Responsible for managing customer accounts" tells a recruiter what any person in that seat was asked to do. It says nothing about how well you did it.

## The rewrite

Before: Responsible for managing customer accounts and relationships.

After: Grew a 140-account SME portfolio by 32% in 12 months, adding ₦380m in new deposits.

## How to do it yourself

- Start with a strong verb: grew, cut, launched, led, rebuilt
- Add the scale: how many accounts, people, branches or naira
- Add the result: what improved, by how much, over what time
- If you do not have exact numbers, use honest estimates you can explain in an interview

Do this for your three most recent roles and your CV will already read differently.`
  },

  {
    author: "company",
    slug: "linkedin-headline-not-job-title",
    title: "Your LinkedIn headline is not your job title",
    date: "2026-08-21",
    topic: "LinkedIn",
    image: "",
    linkedin: "",
    embed: "",
    body: `Your headline appears next to your name almost everywhere on LinkedIn: in search results, comments, connection requests and recruiter lists. If it only repeats your job title, you are wasting the most visible line on your profile.

## A simple structure

What you do + who you do it for + the value you bring.

Before: Relationship Manager at a commercial bank

After: SME Relationship Manager | Portfolio growth, credit and client retention | Banking, Lagos

## Why it works

- Recruiters search by skills and sectors, not only titles
- It tells people why they should connect with you
- It makes your profile easier to find for the roles you actually want

Update yours today, then make sure your About section tells the same story.`
  }

];
