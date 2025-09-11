// src/data/integration-logos.ts

export interface LogoInfo {
    name: string;
    logoUrl: string;
    category: 'Language' | 'Framework/Library' | 'Database' | 'Cloud' | 'DevOps/Deployment' | 'AI/ML' | 'Design' | 'Tool' | 'Certification';
  }
  
  // Trimmed and focused list for 1Tech Academy
  export const integrationLogos: LogoInfo[] = [
  
    // --- Core Languages ---
    { name: "JavaScript", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png", category: 'Language' },
    { name: "Python", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg", category: 'Language' },
    { name: "TypeScript", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg", category: 'Language' },
    { name: "HTML5", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg", category: 'Language' },
    { name: "CSS3", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg", category: 'Language' },
    { name: "SQL", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Sql_data_base_with_logo.svg", category: 'Language' },
    // { name: "C#", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo_C_sharp.svg", category: 'Language' }, // Keep if .NET track is prominent
    // { name: "Dart", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Dart-logo.png", category: 'Language' }, // Keep if Flutter track is prominent
  
    // --- Key Frameworks / Libraries ---
    { name: "React", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", category: 'Framework/Library' },
    { name: "Node.js", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg", category: 'Framework/Library' },
    { name: "Next.js", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg", category: 'Framework/Library' },
    // { name: "Vite", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg", category: 'Framework/Library' }, // Keep if taught explicitly
    { name: "Express.js", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png", category: 'Framework/Library' }, // PNG
    { name: "Tailwind CSS", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg", category: 'Framework/Library' },
    // { name: "Flutter", logoUrl: "https://storage.googleapis.com/cms-storage-bucket/6a07d8a62f4308d2b854.svg", category: 'Framework/Library' }, // Keep if prominent track
    // { name: ".NET", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/.NET_Logo.svg", category: 'Framework/Library' }, // Keep if prominent track
  
    // --- Common Databases ---
    { name: "MongoDB", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg", category: 'Database' },
    { name: "PostgreSQL", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg", category: 'Database' },
    { name: "MySQL", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/MySQL_textlogo.svg", category: 'Database' },
    // { name: "Redis", logoUrl: "https://raw.githubusercontent.com/redis/redis-io/master/public/images/logo.svg", category: 'Database' }, // More advanced topic maybe
  
    // --- Major Cloud Platforms ---
    { name: "AWS", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", category: 'Cloud' },
    { name: "Microsoft Azure", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg", category: 'Cloud' },
    // { name: "Google Cloud", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg", category: 'Cloud' },
  
    // --- Essential DevOps / Deployment / Tools ---
    { name: "Docker", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/79/Docker_%28container_engine%29_logo.png", category: 'DevOps/Deployment' }, // PNG
    // { name: "Kubernetes", logoUrl: "https://raw.githubusercontent.com/kubernetes/kubernetes.github.io/main/images/kubernetes-logo.svg", category: 'DevOps/Deployment' }, // More advanced
    // { name: "Git", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg", category: 'Tool' },
    { name: "GitHub", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/960px-Octicons-mark-github.svg.png", category: 'Tool' }, // Use one version, maybe adapt based on theme?
    // { name: "Vercel", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vercel_logo_black.svg/512px-Vercel_logo_black.svg.png?20221002000905", category: 'DevOps/Deployment' },
    // { name: "Netlify", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Netlify-logo.svg", category: 'DevOps/Deployment' }, // Vercel is often primary with Next.js
  
     // --- Core AI / ML ---
    // { name: "TensorFlow", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg", category: 'AI/ML' }, // Keep if core focus
    { name: "PyTorch", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo_icon.svg", category: 'AI/ML' }, // Often paired with Python Data Science
    { name: "scikit-learn", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg", category: 'AI/ML' },
    // { name: "OpenAI", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg", category: 'AI/ML' }, // Maybe too specific unless courses focus heavily
  
    // --- Key Design / Collaboration Tools ---
    { name: "Figma", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg", category: 'Design' },
    // { name: "Adobe XD", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Adobe_XD_CC_icon.svg", category: 'Design' }, // Figma often dominant
    // { name: "Sketch", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Sketch_Logo.svg", category: 'Design' }, // Mac specific
    { name: "Slack", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg", category: 'Tool' },
    // { name: "Microsoft Teams", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg", category: 'Platform' }, // Slack often primary in dev
    // { name: "Notion", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg", category: 'Tool' }, // Good tool, but maybe not core integration?
  
     // --- Representative Certifications ---
     { name: "AWS Certified", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png", category: 'Certification' }, // Cloud Practitioner example
     { name: "Microsoft Certified", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Microsoft_Certified_Professional.png", category: 'Certification' }, // Fundamentals example
     // { name: "Google Cloud Certified", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Google_Cloud_Certified_Logo.svg", category: 'Certification' },
     { name: "CompTIA Security+", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Comptia-logo.svg/198px-Comptia-logo.svg.png?20160410033732", category: 'Certification' },
  
  ];
