import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  ChevronDownIcon,
  CodeIcon,
  CloudIcon,
  DatabaseIcon,
  DownloadIcon,
  FigmaIcon,
  GitBranchIcon,
  GraduationCapIcon,
  LayersIcon,
  LayoutIcon,
  RocketIcon,
  ServerIcon,
  SmartphoneIcon,
  SparklesIcon,
  TerminalIcon,
  UserIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SkillBadge } from "../components/SkillBadge";
import { useSiteSettings } from "../lib/hooks/useSiteSettings";
import {
  parseCertifications,
  parseEducation,
  parseExperiences,
  parseFaqs,
  parseNameList,
  parseStoryTimeline,
} from "../lib/settingsContent";

type ExperienceCard = {
  role: string;
  company: string;
  period: string;
  type: string;
  description: string;
};
type StoryCard = {
  year: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};
type FaqCard = { q: string; a: string };
type EducationCard = {
  degree: string;
  school: string;
  period: string;
  description?: string;
};

const fallbackSoftSkills = [
  "Leadership",
  "Communication",
  "Problem Solving",
  "Team Collaboration",
  "Time Management",
  "Adaptability",
  "Critical Thinking",
  "Creativity",
  "Attention to Detail",
  "Project Management",
];

const fallbackTechSkills = [
  { name: "React & Next.js", icon: CodeIcon },
  { name: "TypeScript", icon: TerminalIcon },
  { name: "Node.js", icon: ServerIcon },
  { name: "Python", icon: TerminalIcon },
  { name: "PostgreSQL", icon: DatabaseIcon },
  { name: "MongoDB", icon: DatabaseIcon },
  { name: "AWS", icon: CloudIcon },
  { name: "Docker", icon: CloudIcon },
  { name: "React Native", icon: SmartphoneIcon },
  { name: "Tailwind CSS", icon: LayoutIcon },
  { name: "Figma", icon: FigmaIcon },
  { name: "Git & CI/CD", icon: GitBranchIcon },
];

const fallbackExperiences: ExperienceCard[] = [
  {
    role: "Senior Frontend Engineer",
    company: "Tech Innovators Inc.",
    period: "2021 - Present",
    type: "Remote",
    description:
      "Leading the frontend team in building scalable web applications. Improved performance by 40% and established design system guidelines.",
  },
  {
    role: "Full Stack Developer",
    company: "Digital Solutions Agency",
    period: "2018 - 2021",
    type: "Hybrid",
    description:
      "Developed full-stack solutions for various clients. Managed end-to-end delivery of e-commerce platforms and internal tools.",
  },
  {
    role: "Web Developer",
    company: "Creative Studio",
    period: "2016 - 2018",
    type: "On-site",
    description:
      "Created responsive websites and interactive web experiences. Worked closely with designers to implement pixel-perfect UIs.",
  },
];

const storyIconMap: Record<string, LucideIcon> = {
  Rocket: RocketIcon,
  Zap: ZapIcon,
  Layers: LayersIcon,
  Users: UsersIcon,
  Smartphone: SmartphoneIcon,
  Sparkles: SparklesIcon,
  Award: AwardIcon,
  User: UserIcon,
};

const fallbackStories = [
  {
    year: "2016",
    title: "The Beginning",
    desc: "Started my journey in web development, building my first websites and discovering my passion for creating digital experiences.",
    icon: RocketIcon,
  },
  {
    year: "2017",
    title: "First Major Project",
    desc: "Delivered my first enterprise-level project, a complete e-commerce platform that served over 10,000 users.",
    icon: ZapIcon,
  },
  {
    year: "2018",
    title: "Going Full Stack",
    desc: "Expanded my expertise to backend development, mastering Node.js, databases, and cloud infrastructure.",
    icon: LayersIcon,
  },
  {
    year: "2020",
    title: "Leading Teams",
    desc: "Took on my first leadership role, mentoring junior developers and establishing coding standards.",
    icon: UsersIcon,
  },
  {
    year: "2022",
    title: "Mobile Expansion",
    desc: "Ventured into mobile app development with React Native, delivering cross-platform solutions.",
    icon: SmartphoneIcon,
  },
  {
    year: "2024",
    title: "Building the Future",
    desc: "Now focused on AI-powered applications, cloud architecture, and helping businesses transform digitally.",
    icon: SparklesIcon,
  },
];

const fallbackFaqs: FaqCard[] = [
  {
    q: "Why should you choose me?",
    a: "With over 5 years of hands-on experience, I bring a unique combination of technical expertise and creative problem-solving. I focus on delivering clean, scalable code while ensuring exceptional user experiences. My clients appreciate my transparent communication, on-time delivery, and commitment to quality.",
  },
  {
    q: "What services do I provide?",
    a: "I offer end-to-end digital solutions including web development, mobile app development, UI/UX design, backend architecture, cloud deployment, and IT consulting. Whether you need a simple landing page or a complex enterprise application, I have the skills to deliver.",
  },
  {
    q: "You don't have a design concept?",
    a: "No problem! I can work with you from scratch. I offer complete design services including wireframing, prototyping, and visual design. I use tools like Figma to create mockups before development begins, ensuring you're happy with the look and feel before a single line of code is written.",
  },
  {
    q: "What is your development process?",
    a: "I follow an agile methodology: Discovery & Planning → Design & Prototyping → Development → Testing & QA → Deployment → Ongoing Support. Each phase includes client check-ins to ensure alignment with your vision.",
  },
  {
    q: "What other practical knowledge do I have?",
    a: "Beyond coding, I have experience in NGO management, concept notes writing, proposal writing, project management, SEO optimization, digital marketing basics, database administration, server management, and technical writing. I also stay current with industry trends through continuous learning and community involvement.",
  },
  {
    q: "How do I handle project communication?",
    a: "I believe in transparent, regular communication. I provide weekly progress updates, use project management tools like Trello or Notion for task tracking, and I'm always available via email or scheduled calls. You'll never be left wondering about your project's status.",
  },
  {
    q: "What are your rates and payment terms?",
    a: "I offer flexible pricing models including fixed-price projects, hourly rates, and retainer agreements. I provide detailed proposals with clear scope and milestones. Payment is typically structured around project milestones to ensure mutual satisfaction.",
  },
];

const fallbackEducation: EducationCard[] = [
  {
    degree: "MSc Software Engineering",
    school: "State University",
    period: "2016 - 2018",
    description: "Advanced training in modern software engineering practices.",
  },
  {
    degree: "BSc Computer Science",
    school: "University of Technology",
    period: "2012 - 2016",
    description:
      "Foundational study in software engineering and systems design.",
  },
];

const fallbackCertifications = [
  { name: "AWS Certified Solutions Architect", year: "2023" },
  { name: "Google Cloud Professional Developer", year: "2022" },
  { name: "Meta Frontend Developer Certificate", year: "2023" },
  { name: "MongoDB Certified Developer", year: "2021" },
  { name: "Scrum Master Certified (CSM)", year: "2022" },
  { name: "Oracle Java SE Programmer", year: "2020" },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full py-5 flex justify-between items-center text-left focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-main pr-8">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-muted shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mb-5" : "max-h-0 opacity-0"}`}
      >
        <p className="text-muted leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

function getBadgeStyle(type: string) {
  switch (type) {
    case "Remote":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
    case "Hybrid":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
    case "On-site":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function getTechIcon(name: string): LucideIcon {
  return (
    fallbackTechSkills.find((skill) => skill.name === name)?.icon || CodeIcon
  );
}

export function About() {
  const { settings } = useSiteSettings();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const softSkills = parseNameList(settings.aboutSoftSkills).length
    ? parseNameList(settings.aboutSoftSkills)
    : fallbackSoftSkills;
  const technologies = parseNameList(settings.aboutSkillsTechnologies).length
    ? parseNameList(settings.aboutSkillsTechnologies)
    : fallbackTechSkills.map((skill) => skill.name);
  const experiences: ExperienceCard[] = parseExperiences(
    settings.aboutWorkExperience,
  ).length
    ? parseExperiences(settings.aboutWorkExperience).map((item) => ({
        role: item.title,
        company: item.company,
        period: item.period,
        type: item.type,
        description: item.description,
      }))
    : fallbackExperiences;
  const stories = parseStoryTimeline(settings.aboutStoryTimeline).length
    ? parseStoryTimeline(settings.aboutStoryTimeline).map((item) => ({
        year: item.year,
        title: item.title,
        desc: item.description,
        icon: storyIconMap[item.icon] || SparklesIcon,
      }))
    : fallbackStories;
  const faqs: FaqCard[] = parseFaqs(settings.aboutFaqs).length
    ? parseFaqs(settings.aboutFaqs).map((item) => ({
        q: item.question,
        a: item.answer,
      }))
    : fallbackFaqs;
  const education: EducationCard[] = parseEducation(settings.aboutEducation)
    .length
    ? parseEducation(settings.aboutEducation).map((item) => ({
        degree: item.title,
        school: item.institution,
        period: item.year,
        description: item.description,
      }))
    : fallbackEducation;
  const certifications = parseCertifications(settings.aboutCertifications)
    .length
    ? parseCertifications(settings.aboutCertifications)
    : fallbackCertifications;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-16 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start mb-24">
        <div className="w-full md:w-1/2 space-y-8 px-4">
          <div className="aspect-square max-w-md bg-surface-dark rounded-2xl overflow-hidden relative shadow-xl mx-auto md:mx-0 border border-border">
            {settings.aboutImageUrl ? (
              <img
                src={settings.aboutImageUrl}
                alt="About"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center">
                <UserIcon className="w-24 h-24 text-primary/40 mb-4" />
                <span className="text-sm text-muted font-medium">
                  Upload photo
                </span>
              </div>
            )}
          </div>

          <div className="max-w-md mx-auto md:mx-0">
            <h3 className="text-sm font-bold text-main uppercase tracking-wider mb-3">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-6 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-main">
            {settings.aboutHeading || "Hi, I'm Masebba."}
          </h1>
          <h2 className="text-xl text-muted font-medium">
            {settings.aboutSubheading ||
              "Full Stack Developer based in San Francisco, CA."}
          </h2>
          <div className="prose prose-lg prose-invert text-justify text-muted whitespace-pre-wrap">
            {settings.aboutBio ||
              "With over 5 years of experience in web development"}
          </div>
          <div className="pt-4 flex flex-wrap gap-4">
            {settings.resumeUrl ? (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noreferrer"
                download
              >
                <Button className="gap-2">
                  <DownloadIcon className="w-4 h-4" /> Download CV
                </Button>
              </a>
            ) : null}
            <Link to="/contact">
              <Button variant="outline">Contact Me</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-main mb-4">
            Skills & Technologies
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            A comprehensive list of tools and technologies I use to bring ideas
            to life.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {technologies.map((skill) => (
            <SkillBadge key={skill} name={skill} icon={getTechIcon(skill)} />
          ))}
        </div>
      </div>

      <div className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-main mb-4">Work Experience</h2>
          <p className="text-muted max-w-2xl mx-auto">
            My professional journey and the companies I have had the pleasure to
            work with.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <Card
              key={`${exp.role}-${index}`}
              padding="lg"
              className="relative overflow-hidden group hover:border-primary transition-colors"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-main">{exp.role}</h3>
                  <p className="text-primary font-medium">{exp.company}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {exp.type ? (
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${getBadgeStyle(exp.type)}`}
                    >
                      {exp.type}
                    </span>
                  ) : null}
                  <span className="inline-block px-3 py-1 bg-surface rounded-full text-sm font-medium text-muted whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
              </div>
              <p className="text-muted leading-relaxed">{exp.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-main mb-4">
            Professional Story
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            The milestones that shaped my career and expertise over the years.
          </p>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block" />
          <div className="space-y-2">
            {stories.map((story, index) => {
              const isEven = index % 2 === 0;
              const Icon = story.icon;
              return (
                <div
                  key={`${story.year}-${story.title}-${index}`}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-8 ${isEven ? "sm:flex-row-reverse" : ""}`}
                >
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-surface items-center justify-center z-10 shadow-sm hover:border-primary">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div
                    className={`w-full sm:w-1/2 ${isEven ? "sm:pl-12" : "sm:pr-12"}`}
                  >
                    <Card
                      padding="sm"
                      className="relative hover:-translate-y-1 transition-transform duration-300 hover:border-primary"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm font-black text-primary p-1 ">
                          {story.year}
                        </span>
                        <h3 className="text-lg font-bold text-main">
                          {story.title}
                        </h3>
                      </div>
                      <p className="text-muted leading-relaxed">{story.desc}</p>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-main mb-4">
            Education & Credentials
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            My academic background and professional certifications.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h3 className="text-xl font-bold text-main mb-6 flex items-center gap-2">
              <GraduationCapIcon className="w-6 h-6 text-primary" />
              Academic Background
            </h3>
            <div className="space-y-6">
              {education.map((edu, idx) => (
                <Card
                  key={`${edu.degree}-${idx}`}
                  padding="md"
                  className={`border-l-4 ${idx === 0 ? "hover:border-primary transition-colors" : "hover:border-primary transition-colors/50"}`}
                >
                  <h4 className="font-bold text-main text-lg">{edu.degree}</h4>
                  <p className="text-primary font-medium mb-2">{edu.school}</p>
                  <p className="text-sm text-muted">{edu.period}</p>
                  {edu.description ? (
                    <p className="text-muted mt-3 leading-relaxed">
                      {edu.description}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-main mb-6 flex items-center gap-2">
              <AwardIcon className="w-6 h-6 text-primary" />
              Licenses, Certifications & Budges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <Card
                  key={`${cert.name}-${index}`}
                  padding="sm"
                  className="hover:border-primary transition-colors flex flex-col justify-between h-full"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AwardIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <h4 className="font-bold text-main text-sm leading-snug">
                      {cert.name}
                    </h4>
                  </div>
                  <p className="text-xs font-medium text-muted bg-background inline-block px-2 py-1 rounded w-fit">
                    Issued {cert.year}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="m-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-main mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Common questions about my services and work process.
          </p>
        </div>
        <div className="max-w-5xl mx-auto bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={`${faq.q}-${index}`}
              question={faq.q}
              answer={faq.a}
              isOpen={openFaqIndex === index}
              onClick={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
