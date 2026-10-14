/* =========================================================================
   SITE DATA — edit this file to update news and publications.
   No build step needed: commit & push, GitHub Pages does the rest.
   ========================================================================= */

/* Research themes. `key` is used by publications (themes: [...]),
   by the research cards and by the hub nodes of the header network. */
window.THEMES = [
  /* order = position around the header graph; neighbours share papers */
  { key: "mh",     hub: "mental health\ncommunities",          title: "Online mental health communities" },
  { key: "polar",  hub: "polarisation &\necho chambers",       title: "Online polarisation & echo chambers" },
  { key: "recsys", hub: "social media\nrecommender systems",   title: "Social media recommender systems" },
  { key: "abm",    hub: "LLM agents &\nsocial simulation",     title: "LLM agents & social simulation" },
  { key: "rai",    hub: "responsible AI",                       title: "Responsible AI & transparency" }
];
/* the thread that ties every paper together (centre of the header graph) */
window.CORE = { label: "online social\nplatforms", title: "online social platforms" };

/* News — newest first. `date` is free text. Basic HTML allowed in `text`. */
window.NEWS = [
  { date: "Aug 2026", text: "Co-organised the 2nd edition of <b>Simulated Societies</b> — from opinion dynamics models to digital twins — at ASONAM 2026, Rabat." },
  { date: "Jul 2026", text: "New preprint: how recommender systems and network structure <em>jointly</em> shape the visibility of content and creators. <a href=\"https://arxiv.org/abs/2607.00258\">arXiv</a>" },
  { date: "Jun 2026", text: "Tutor at the 4th International SoBigData Summer School, Baratti — <em>Data Analysis and AI in Sport, Health and Wellbeing</em>." },
  { date: "May 2026", text: "Co-chaired the 1st <b>Digital Minds</b> workshop at ICWSM 2026, Los Angeles. A Frontiers in AI special issue on the same topic follows — I'm a Topic Editor." },
  { date: "May 2026", text: "Talk at CS2Italy (Turin) on participant behaviour and community response in online mental health communities." },
  { date: "2026",     text: "<b>YSocial</b>, our LLM-powered social media digital twin, is published in <em>Big Data &amp; Society</em>." }
];

/* Publications.
   type:   journal | conference | book | preprint | thesis
   themes: keys from THEMES above
   flag:   optional short badge, e.g. "most cited"                       */
window.PUBLICATIONS = [
  { year: 2026, type: "preprint", themes: ["recsys", "abm"],
    authors: "V. Morini, V. Pansanella, L. Pappalardo, D. Pedreschi, G. Rossetti",
    title: "Joint Effects of Recommender Systems and Network Structure on the Visibility of Content and Creators",
    venue: "arXiv preprint 2607.00258", url: "https://arxiv.org/abs/2607.00258" },

  { year: 2026, type: "preprint", themes: ["polar"],
    authors: "G. Di Bona, E. Fraxanet, B. Komander, A. Lo Sasso, V. Morini, A. Vendeville, M. Falkenberg, A. Galeazzi",
    title: "Sampled Social Media Data Risk Biased and Inconsistent Estimates of Online Social Phenomena",
    venue: "SocArXiv preprint", url: "https://doi.org/10.31235/osf.io/37jz9" },

  { year: 2026, type: "journal", themes: ["abm", "recsys"],
    authors: "G. Rossetti, M. Stella, R. Cazabet, K. Abramski, S. Citraro, E. Cau, A. Failla, V. Morini, V. Pansanella",
    title: "YSocial: An Artificial Intelligence Powered Social Media Virtual Twin",
    venue: "Big Data & Society, 13(3), 1–18", url: "https://doi.org/10.1177/20539517261431576" },

  { year: 2026, type: "journal", themes: ["mh"],
    authors: "V. Morini, S. Citraro, E. Sajno, M. Sansoni, G. Riva, M. Stella, G. Rossetti",
    title: "Reddit Depression Communities as Spaces of Emotion Regulation: A Data-Informed Analysis of Coping and Engagement",
    venue: "Future Internet, 18(4), 198", url: "https://doi.org/10.3390/fi18040198" },

  { year: 2025, type: "journal", themes: ["mh"], flag: "selected",
    authors: "V. Morini, M. Sansoni, G. Rossetti, D. Pedreschi, C. Castillo",
    title: "Participant Behavior and Community Response in Online Mental Health Communities: Insights from Reddit",
    venue: "Computers in Human Behavior, 165, 108544", url: "https://doi.org/10.1016/j.chb.2024.108544" },

  { year: 2025, type: "journal", themes: ["mh"],
    authors: "V. Morini, S. Citraro, E. Sajno, M. Sansoni, G. Riva, M. Stella, G. Rossetti",
    title: "Online Posting Effects: Unveiling the Non-Linear Journeys of Users in Depression Communities on Reddit",
    venue: "Computers in Human Behavior Reports, 17, 100542", url: "https://doi.org/10.1016/j.chbr.2024.100542" },

  { year: 2025, type: "journal", themes: ["polar"],
    authors: "A. Baqir, Y. Chen, F. Diaz-Diaz, S. Kiyak, T. Louf, V. Morini, V. Pansanella, M. Torricelli, A. Galeazzi",
    title: "Unveiling the Drivers of Active Participation in Social Media Discourse",
    venue: "Scientific Reports, 15, 4906", url: "https://doi.org/10.1038/s41598-025-88117-x" },

  { year: 2025, type: "conference", themes: ["polar"],
    authors: "V. Mesina, A. Failla, V. Morini, G. Rossetti",
    title: "Whose Voice Matters? Authority and Influence in the Italian Twitter Debates on Covid-19",
    venue: "Complex Networks & Their Applications XIII, Springer, pp. 352–363", url: "https://doi.org/10.1007/978-3-031-82431-9_29" },

  { year: 2025, type: "thesis", themes: ["polar", "mh"],
    authors: "V. Morini",
    title: "The Duality of Social Media Discourse: Characterizing Polluted and Supportive Online Behaviors",
    venue: "PhD thesis, National PhD in Artificial Intelligence (AI & Society), University of Pisa", url: "" },

  { year: 2024, type: "journal", themes: ["polar"],
    authors: "E. Cau, V. Morini, G. Rossetti",
    title: "Trends and Topics: Characterizing Echo Chambers' Topological Stability and In-Group Attitudes",
    venue: "PLOS Complex Systems, 1(2), e0000008", url: "https://doi.org/10.1371/journal.pcsy.0000008" },

  { year: 2024, type: "journal", themes: ["rai"],
    authors: "A. Knott, D. Pedreschi, T. Jitsuzumi, S. Leavy, D. Eyers, T. Chakraborti, A. Trotman, S. Sundareswaran, R. Baeza-Yates, P. Biecek, A. Weller, P. D. Teal, S. Basu, M. Haklidir, V. Morini, S. Russell, Y. Bengio",
    title: "AI Content Detection in the Emerging Information Ecosystem: New Obligations for Media and Tech Companies",
    venue: "Ethics and Information Technology, 26, 63", url: "https://doi.org/10.1007/s10676-024-09795-1" },

  { year: 2024, type: "conference", themes: ["polar"],
    authors: "M. J. Maggini, V. Morini, D. Bassi, G. Rossetti",
    title: "Diachronic Political Content Analysis: A Comparative Study of Topics and Sentiments in Echo Chambers and Beyond",
    venue: "CODAI 2024 Workshop @ ECAI 2024, CEUR-WS Vol. 3782", url: "https://ceur-ws.org/Vol-3782/" },

  { year: 2024, type: "preprint", themes: ["recsys", "polar"],
    authors: "L. Pappalardo, E. Ferragina, S. Citraro, G. Cornacchia, M. Nanni, G. Rossetti, G. Gezici, F. Giannotti, M. Lalli, D. Gambetta, G. Mauro, V. Morini, V. Pansanella, D. Pedreschi",
    title: "A Survey on the Impact of AI-Based Recommenders on Human Behaviours: Methodologies, Outcomes and Future Directions",
    venue: "arXiv preprint 2407.01630", url: "https://arxiv.org/abs/2407.01630" },

  { year: 2023, type: "journal", themes: ["mh"],
    authors: "S. M. Joseph, S. Citraro, V. Morini, G. Rossetti, M. Stella",
    title: "Cognitive Network Neighborhoods Quantify Feelings Expressed in Suicide Notes and Reddit Mental Health Communities",
    venue: "Physica A, 610, 128336", url: "https://doi.org/10.1016/j.physa.2022.128336" },

  { year: 2023, type: "book", themes: ["recsys", "abm"],
    authors: "D. Pedreschi, F. Dignum, V. Morini, V. Pansanella, G. Cornacchia",
    title: "Towards a Social Artificial Intelligence",
    venue: "Human-Centered Artificial Intelligence: Advanced Lectures, Springer, pp. 415–428", url: "https://doi.org/10.1007/978-3-031-24349-3_21" },

  { year: 2023, type: "conference", themes: ["rai"],
    authors: "M. Marchiori Manerba, V. Morini",
    title: "Exposing Racial Dialect Bias in Abusive Language Detection: Can Explainability Play a Role?",
    venue: "ECML-PKDD Workshops, Springer, pp. 483–497", url: "https://doi.org/10.1007/978-3-031-23618-1_32" },

  { year: 2023, type: "conference", themes: ["polar"],
    authors: "V. Pansanella, V. Morini, T. Squartini, G. Rossetti",
    title: "Change My Mind: Data-Driven Estimate of Open-Mindedness from Political Discussions",
    venue: "Complex Networks & Their Applications XI, Springer, pp. 86–97", url: "https://doi.org/10.1007/978-3-031-21127-0_8" },

  { year: 2023, type: "conference", themes: ["polar"],
    authors: "C. Buongiovanni, R. Candusso, G. Cerretini, D. Febbe, V. Morini, G. Rossetti",
    title: "Will You Take the Knee? Italian Twitter Echo Chambers' Genesis During EURO 2020",
    venue: "Complex Networks & Their Applications XI, Springer, pp. 29–40", url: "https://doi.org/10.1007/978-3-031-21127-0_3" },

  { year: 2021, type: "journal", themes: ["polar"], flag: "most cited",
    authors: "V. Morini, L. Pollacci, G. Rossetti",
    title: "Toward a Standard Approach for Echo Chamber Detection: Reddit Case Study",
    venue: "Applied Sciences, 11(12), 5390", url: "https://doi.org/10.3390/app11125390" },

  { year: 2021, type: "journal", themes: ["abm"],
    authors: "G. Rossetti, L. Milli, S. Citraro, V. Morini",
    title: "UTLDR: An Agent-Based Framework for Modeling Infectious Diseases and Public Interventions",
    venue: "Journal of Intelligent Information Systems, 57(2), 347–368", url: "https://doi.org/10.1007/s10844-021-00649-6" },

  { year: 2020, type: "conference", themes: ["polar"],
    authors: "V. Morini, L. Pollacci, G. Rossetti",
    title: "Capturing Political Polarization of Reddit Submissions in the Trump Era",
    venue: "SEBD 2020, CEUR-WS Vol. 2646, pp. 80–87", url: "https://ceur-ws.org/Vol-2646/" }
];
