export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestedRoles: string[];
  suggestions: string[];
}

const SKILL_DATABASE = {
  frontend: [
    'react', 'angular', 'vue', 'next.js', 'nextjs', 'nuxt', 'html', 'css', 'tailwind', 'sass',
    'javascript', 'typescript', 'js', 'ts', 'redux', 'webpack', 'vite', 'graphql', 'rest api',
    'bootstrap', 'material ui', 'mui', 'jquery', 'svelte', 'solidjs'
  ],
  backend: [
    'node.js', 'nodejs', 'express', 'nest.js', 'nestjs', 'python', 'django', 'flask', 'fastapi',
    'java', 'spring', 'springboot', 'go', 'golang', 'rust', 'ruby', 'rails', 'php', 'laravel',
    'c#', '.net', 'asp.net', 'c++', 'graphql', 'apollo', 'grpc', 'microservices'
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'mongo', 'redis', 'cassandra',
    'dynamodb', 'firebase', 'supabase', 'prisma', 'sequelize', 'mongoose', 'oracle', 'mariadb'
  ],
  devops: [
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
    'cicd', 'ci/cd', 'github actions', 'jenkins', 'gitlab', 'terraform', 'ansible', 'git',
    'linux', 'nginx', 'apache', 'prometheus', 'grafana', 'serverless'
  ],
  aiData: [
    'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence', 'ai', 'pytorch',
    'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'nlp', 'llm', 'langchain',
    'openai', 'huggingface', 'data science', 'computer vision', 'opencv', 'r', 'tableau', 'powerbi'
  ],
  management: [
    'agile', 'scrum', 'kanban', 'jira', 'confluence', 'git', 'communication', 'leadership',
    'teamwork', 'problem solving', 'project management', 'product management', 'system design',
    'sdlc', 'qa', 'testing', 'jest', 'cypress', 'playwright', 'tdd'
  ]
};

export function parseResume(text: string): AnalysisResult {
  const lowercaseText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // 1. Identify Sections
  const hasExperience = /experience|work\s+history|employment|professional\s+background|career/i.test(text);
  const hasEducation = /education|academic|university|college|degree|studies/i.test(text);
  const hasSkills = /skills|technologies|expertise|technical\s+skills|proficiencies/i.test(text);
  const hasProjects = /projects|portfolio|personal\s+work|key\s+accomplishments/i.test(text);
  const hasCertifications = /certifications|certificates|licenses|courses/i.test(text);

  // 2. Identify Contact Info & Links
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(lowercaseText);
  const hasGitHub = /github\.com/i.test(lowercaseText);
  const hasPortfolio = /portfolio|website|my-site/i.test(lowercaseText) || (hasLinkedIn && hasGitHub);

  // 3. Extract Skills
  const extractedSkills: string[] = [];
  const skillCategories: { [key: string]: number } = {
    frontend: 0,
    backend: 0,
    database: 0,
    devops: 0,
    aiData: 0,
    management: 0
  };

  Object.entries(SKILL_DATABASE).forEach(([category, skills]) => {
    skills.forEach(skill => {
      // Use word boundaries for skill check, ensuring we don't match substring of a larger word
      // e.g., 'go' shouldn't match in 'google', 'html' shouldn't match in 'xhtml' (though xhtml has html)
      // Escaping special characters in skill for regex
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(lowercaseText)) {
        extractedSkills.push(skill);
        skillCategories[category]++;
      }
    });
  });

  // Unique skills
  const uniqueSkills = Array.from(new Set(extractedSkills));

  // 4. Scoring Algorithm (Max 100)
  let score = 30; // base score for uploading a parseable text resume

  // Contact info (Max 15 points)
  if (hasEmail) score += 5;
  if (hasPhone) score += 5;
  if (hasLinkedIn || hasGitHub) score += 5;

  // Key Sections (Max 35 points)
  if (hasExperience) score += 10;
  if (hasSkills) score += 10;
  if (hasEducation) score += 8;
  if (hasProjects) score += 7;

  // Skill Depth (Max 15 points)
  const skillsCount = uniqueSkills.length;
  if (skillsCount >= 12) score += 15;
  else if (skillsCount >= 7) score += 10;
  else if (skillsCount >= 3) score += 5;

  // Length & Formatting (Max 5 points)
  if (wordCount >= 300 && wordCount <= 1000) {
    score += 5;
  } else if (wordCount > 150 && wordCount < 1500) {
    score += 3;
  }

  // Cap score at 99 (gives room for improvement)
  score = Math.min(Math.max(Math.round(score), 10), 99);

  // 5. Strengths
  const strengths: string[] = [];
  if (hasEmail && hasPhone) {
    strengths.push('Complete core contact details (Email, Phone) provided.');
  }
  if (hasLinkedIn && hasGitHub) {
    strengths.push('Strong professional online presence established with LinkedIn and GitHub links.');
  } else if (hasLinkedIn || hasGitHub) {
    strengths.push('Included professional profile links for portfolio validation.');
  }

  if (hasExperience && wordCount > 400) {
    strengths.push('Detailed career history or project documentation.');
  }
  if (hasSkills && skillsCount > 8) {
    strengths.push(`Strong vocabulary of technical competencies (${skillsCount} skills detected).`);
  }
  if (hasProjects) {
    strengths.push('Dedicated projects section showcasing hands-on applications.');
  }
  if (hasEducation) {
    strengths.push('Academic qualifications and credentials clearly detailed.');
  }
  if (hasCertifications) {
    strengths.push('Demonstrates continuous learning with specialized certifications.');
  }

  if (strengths.length === 0) {
    strengths.push('Initial basic structure is set up.');
  }

  // 6. Weaknesses
  const weaknesses: string[] = [];
  if (!hasEmail) {
    weaknesses.push('Missing email address. Employers cannot easily reach you.');
  }
  if (!hasPhone) {
    weaknesses.push('Missing contact phone number for quick screening.');
  }
  if (!hasLinkedIn) {
    weaknesses.push('Missing LinkedIn profile link, which is standard for modern recruiters.');
  }
  if (!hasGitHub && (skillCategories.frontend > 0 || skillCategories.backend > 0)) {
    weaknesses.push('No GitHub link found. Tech recruiters look for code repositories.');
  }
  if (!hasExperience) {
    weaknesses.push('No formal "Experience" section. Focus on documenting professional or freelance roles.');
  }
  if (!hasProjects) {
    weaknesses.push('Missing a dedicated "Projects" section to demonstrate practical execution of your skills.');
  }
  if (!hasSkills || skillsCount < 5) {
    weaknesses.push('Low keyword density. Modern Applicant Tracking Systems (ATS) scan for matching terms.');
  }
  if (wordCount < 250) {
    weaknesses.push('Content is extremely brief. The resume may lack the depth required for thorough evaluation.');
  } else if (wordCount > 1300) {
    weaknesses.push('Resume word count is very high. Try to condense and focus on high-impact bullet points.');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No severe structural structural gaps found, but wording can be optimized.');
  }

  // 7. Missing Skills (Identify which categories they are active in, and suggest popular missing ones)
  const missingSkills: string[] = [];
  
  // Look at category weights
  const maxCategory = Object.keys(skillCategories).reduce((a, b) => skillCategories[a] > skillCategories[b] ? a : b);
  
  // Suggest skills they DON'T have from the categories they are strongest in, or general in-demand skills
  const checkAndSuggest = (categoryName: keyof typeof SKILL_DATABASE, limit = 3) => {
    let count = 0;
    const list = SKILL_DATABASE[categoryName];
    for (const item of list) {
      if (!uniqueSkills.includes(item)) {
        // Clean display name
        const displayName = item.toUpperCase() === 'JS' ? 'JavaScript' :
                            item.toUpperCase() === 'TS' ? 'TypeScript' :
                            item.charAt(0).toUpperCase() + item.slice(1);
        if (!missingSkills.includes(displayName)) {
          missingSkills.push(displayName);
          count++;
        }
        if (count >= limit) break;
      }
    }
  };

  // Build missing skills suggestions
  if (skillCategories.frontend > 0 || maxCategory === 'frontend') {
    checkAndSuggest('frontend', 2);
  }
  if (skillCategories.backend > 0 || maxCategory === 'backend') {
    checkAndSuggest('backend', 2);
  }
  if (skillCategories.devops > 0 || maxCategory === 'devops') {
    checkAndSuggest('devops', 2);
  }
  if (skillCategories.aiData > 0 || maxCategory === 'aiData') {
    checkAndSuggest('aiData', 2);
  }
  if (missingSkills.length < 5) {
    checkAndSuggest('management', 3);
  }

  // Ensure we display at least some recommendations
  if (missingSkills.length === 0) {
    missingSkills.push('TypeScript', 'Docker', 'System Design', 'CI/CD');
  }

  // 8. Suggested Job Roles
  const suggestedRoles: string[] = [];
  const totalScore = Object.values(skillCategories).reduce((sum, val) => sum + val, 0);

  if (totalScore === 0) {
    suggestedRoles.push('Junior Software Engineer', 'Technology Intern');
  } else {
    // Sort categories
    const sortedCategories = Object.entries(skillCategories)
      .sort((a, b) => b[1] - a[1]);

    const primaryCat = sortedCategories[0][0];
    const secondaryCat = sortedCategories[1][0];

    if (primaryCat === 'frontend') {
      suggestedRoles.push('Frontend Developer');
      if (skillCategories.backend > 0) {
        suggestedRoles.push('Full Stack Engineer');
      } else {
        suggestedRoles.push('Web Developer');
      }
    } else if (primaryCat === 'backend') {
      suggestedRoles.push('Backend Engineer');
      if (skillCategories.frontend > 0) {
        suggestedRoles.push('Full Stack Engineer');
      } else if (skillCategories.devops > 0) {
        suggestedRoles.push('DevOps/Backend Engineer');
      }
    } else if (primaryCat === 'devops') {
      suggestedRoles.push('DevOps Engineer');
      suggestedRoles.push('Cloud Infrastructure Engineer');
    } else if (primaryCat === 'aiData') {
      if (lowercaseText.includes('learning') || lowercaseText.includes('pytorch') || lowercaseText.includes('tensorflow')) {
        suggestedRoles.push('Machine Learning Engineer');
      } else {
        suggestedRoles.push('Data Scientist');
      }
      suggestedRoles.push('AI Engineer');
    } else {
      suggestedRoles.push('Software Engineer');
      suggestedRoles.push('QA Analyst / Test Engineer');
    }

    if (skillCategories.management > 0 && suggestedRoles.length < 3) {
      suggestedRoles.push('Technical Project Manager');
    }
  }

  // Limit to 3 roles
  const finalRoles = Array.from(new Set(suggestedRoles)).slice(0, 3);

  // 9. AI Suggestions
  const suggestions: string[] = [];
  suggestions.push('Format your experience bullet points using the STAR method (Situation, Task, Action, Result) to emphasize impact.');
  
  if (uniqueSkills.length < 10) {
    suggestions.push('Create a dedicated "Skills" grid at the top of your resume, divided into Core Languages, Frameworks, and Dev Tools.');
  }
  if (!hasLinkedIn || !hasGitHub) {
    suggestions.push('Add hyperlinks to your LinkedIn profile and GitHub page directly in the header of the document.');
  }
  if (wordCount < 300) {
    suggestions.push('Expand on your project descriptions. Detail the stack, your role, and the technical challenges you solved.');
  } else if (wordCount > 1000) {
    suggestions.push('Keep the resume page-density in check. Avoid large blocks of text; use short, bulleted lists instead.');
  }

  suggestions.push('Include metrics and quantifiable achievements (e.g., "Increased API response times by 30%", "Managed a team of 4 devs").');
  suggestions.push('Ensure consistent layout formatting (matching margins, fonts, and bullet styles) to pass recruiter visual scans.');

  return {
    score,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    missingSkills: missingSkills.slice(0, 6),
    suggestedRoles: finalRoles,
    suggestions: suggestions.slice(0, 5)
  };
}
