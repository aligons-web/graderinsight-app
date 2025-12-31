import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, GripVertical, Trash2, ChevronDown, ChevronUp, FileText, Download, Upload, Loader2, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Rubric, Criterion, ProficiencyLevel, EducationLevel, TemplateType } from "@shared/schema";

const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "tech_college", label: "2-Year Technical College" },
  { value: "four_year_college", label: "4-Year College" },
  { value: "graduate", label: "Graduate School" },
];

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: "essay", label: "Essay/Research Writing" },
  { value: "presentation", label: "Presentation" },
];

const DEFAULT_PROFICIENCY_LEVELS: Omit<ProficiencyLevel, "id">[] = [
  { name: "Excellent", score: 4, description: "" },
  { name: "Good", score: 3, description: "" },
  { name: "Satisfactory", score: 2, description: "" },
  { name: "Needs Improvement", score: 1, description: "" },
];

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultCriterion(): Criterion {
  return {
    id: generateId(),
    name: "New Criterion",
    weight: 25,
    levels: DEFAULT_PROFICIENCY_LEVELS.map((level) => ({
      ...level,
      id: generateId(),
    })),
  };
}

function createDefaultRubric(): Rubric {
  const criterion = createDefaultCriterion();
  return {
    id: generateId(),
    name: "Untitled Rubric",
    description: "",
    criteria: [criterion],
    totalPoints: criterion.weight,
    isTemplate: false,
    latePolicy: { enabled: false, description: "" },
    revisionPolicy: { enabled: false, description: "" },
  };
}

// Comprehensive templates for all education levels
const ESSAY_TEMPLATES: Record<EducationLevel, Rubric> = {
  middle_school: {
    id: "ms-essay",
    name: "Middle School Research Writing Rubric",
    description: "Standard rubric for evaluating middle school research writing assignments. Total: 100 Points | Minimum Length: 200 Words",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "middle_school",
    templateType: "essay",
    minimumLength: "200 words",
    latePolicy: { enabled: true, description: "1 day late: -5 pts | 2 days late: -10 pts | 3+ days late: teacher discretion" },
    revisionPolicy: { enabled: true, description: "One revision allowed | Maximum score after revision: 90 pts | Revision due within 5 days" },
    criteria: [
      {
        id: "ms-c1", name: "Writing Quality & Clarity", weight: 25,
        levels: [
          { id: "ms-l1", name: "Excellent (23-25)", score: 25, description: "Complete sentences, basic grammar and capitalization, appropriate word choice, clear meaning" },
          { id: "ms-l2", name: "Good (18-22)", score: 22, description: "Mostly complete sentences with minor errors" },
          { id: "ms-l3", name: "Satisfactory (13-17)", score: 17, description: "Some sentence issues affecting clarity" },
          { id: "ms-l4", name: "Needs Improvement (0-12)", score: 12, description: "Significant writing issues" },
        ],
      },
      {
        id: "ms-c2", name: "Organization & Development", weight: 25,
        levels: [
          { id: "ms-l5", name: "Excellent (23-25)", score: 25, description: "Clear main idea, paragraphs stay on topic, supporting details included, simple transitions" },
          { id: "ms-l6", name: "Good (18-22)", score: 22, description: "Generally clear organization with minor gaps" },
          { id: "ms-l7", name: "Satisfactory (13-17)", score: 17, description: "Some organizational issues" },
          { id: "ms-l8", name: "Needs Improvement (0-12)", score: 12, description: "Disorganized or incomplete" },
        ],
      },
      {
        id: "ms-c3", name: "Source Use & Documentation", weight: 25,
        levels: [
          { id: "ms-l9", name: "Excellent (23-25)", score: 25, description: "At least 1-2 teacher-approved sources, basic in-text citation, sources listed, information relates to topic" },
          { id: "ms-l10", name: "Good (18-22)", score: 22, description: "Sources present with minor citation issues" },
          { id: "ms-l11", name: "Satisfactory (13-17)", score: 17, description: "Limited source use or citation problems" },
          { id: "ms-l12", name: "Needs Improvement (0-12)", score: 12, description: "Missing or improperly used sources" },
        ],
      },
      {
        id: "ms-c4", name: "Assignment Requirements", weight: 25,
        levels: [
          { id: "ms-l13", name: "Excellent (23-25)", score: 25, description: "Minimum word count met (200+ words), instructions followed, original work, clear ending or summary" },
          { id: "ms-l14", name: "Good (18-22)", score: 22, description: "Most requirements met" },
          { id: "ms-l15", name: "Satisfactory (13-17)", score: 17, description: "Some requirements missing" },
          { id: "ms-l16", name: "Needs Improvement (0-12)", score: 12, description: "Major requirements unmet" },
        ],
      },
    ],
  },
  high_school: {
    id: "hs-essay",
    name: "High School Research Paper Rubric",
    description: "Comprehensive rubric for high school research paper evaluation. Total: 100 Points | Minimum Length: 400 Words",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "high_school",
    templateType: "essay",
    minimumLength: "400 words",
    latePolicy: { enabled: true, description: "24 hrs late: -10 pts | 2-3 days late: -20 pts | 4+ days late: not accepted without approval" },
    revisionPolicy: { enabled: true, description: "One revision allowed for scores under 85 | Max revision score: 85 | Due within 7 days" },
    criteria: [
      {
        id: "hs-c1", name: "Writing Quality & Style", weight: 25,
        levels: [
          { id: "hs-l1", name: "Excellent (23-25)", score: 25, description: "Correct grammar and sentence structure, varied sentence beginnings, formal academic tone, concise wording" },
          { id: "hs-l2", name: "Good (18-22)", score: 22, description: "Minor errors that don't affect meaning" },
          { id: "hs-l3", name: "Satisfactory (13-17)", score: 17, description: "Frequent errors affecting readability" },
          { id: "hs-l4", name: "Needs Improvement (0-12)", score: 12, description: "Writing significantly interferes with comprehension" },
        ],
      },
      {
        id: "hs-c2", name: "Organization & Development", weight: 25,
        levels: [
          { id: "hs-l5", name: "Excellent (23-25)", score: 25, description: "Clear thesis statement, topic sentences guide paragraphs, evidence supports ideas, logical flow" },
          { id: "hs-l6", name: "Good (18-22)", score: 22, description: "Generally clear with minor gaps" },
          { id: "hs-l7", name: "Satisfactory (13-17)", score: 17, description: "Weak structure or limited development" },
          { id: "hs-l8", name: "Needs Improvement (0-12)", score: 12, description: "Disorganized or incomplete" },
        ],
      },
      {
        id: "hs-c3", name: "Source Use & Citation", weight: 25,
        levels: [
          { id: "hs-l9", name: "Excellent (23-25)", score: 25, description: "Credible sources (minimum 2-3), correct in-text citations, proper works cited page, sources integrated smoothly" },
          { id: "hs-l10", name: "Good (18-22)", score: 22, description: "Minor citation or integration issues" },
          { id: "hs-l11", name: "Satisfactory (13-17)", score: 17, description: "Weak or inconsistent source use" },
          { id: "hs-l12", name: "Needs Improvement (0-12)", score: 12, description: "Missing, incorrect, or improperly used sources" },
        ],
      },
      {
        id: "hs-c4", name: "Technical & Assignment Requirements", weight: 25,
        levels: [
          { id: "hs-l13", name: "Excellent (23-25)", score: 25, description: "Minimum word count met (400+ words), plagiarism check passed, assignment instructions followed, clear conclusion" },
          { id: "hs-l14", name: "Good (18-22)", score: 22, description: "One minor requirement issue" },
          { id: "hs-l15", name: "Satisfactory (13-17)", score: 17, description: "Multiple requirement issues" },
          { id: "hs-l16", name: "Needs Improvement (0-12)", score: 12, description: "Major requirements unmet" },
        ],
      },
    ],
  },
  tech_college: {
    id: "tc-essay",
    name: "2-Year Technical College Research Paper Rubric",
    description: "Professional rubric for technical college research paper evaluation. Total: 100 Points | Minimum Length: 300 Words. Policy Notice: Assignments that do not meet the minimum word count may not earn full credit in Criterion 4.",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "tech_college",
    templateType: "essay",
    minimumLength: "300 words",
    latePolicy: { enabled: true, description: "Up to 24 hours late: -10 points | 25-72 hours late: -20 points | More than 72 hours late: Not accepted unless prior approval is granted" },
    revisionPolicy: { enabled: true, description: "One revision allowed if original submission scored below 85 points | Maximum revision score: 85 points | Revised submission must be turned in within 7 days of feedback | Original feedback must be addressed for revision credit" },
    criteria: [
      {
        id: "tc-c1", name: "Writing Quality & Clarity", weight: 25,
        levels: [
          { id: "tc-l1", name: "Excellent (23-25)", score: 25, description: "Clear, polished, and professional. Sentence structure and clarity, grammar and subject-verb agreement, conciseness, word choice appropriate for academic audience" },
          { id: "tc-l2", name: "Good (18-22)", score: 22, description: "Minor errors that do not affect meaning" },
          { id: "tc-l3", name: "Satisfactory (13-17)", score: 17, description: "Frequent errors affecting readability" },
          { id: "tc-l4", name: "Needs Improvement (0-12)", score: 12, description: "Writing significantly interferes with comprehension" },
        ],
      },
      {
        id: "tc-c2", name: "Organization & Development", weight: 25,
        levels: [
          { id: "tc-l5", name: "Excellent (23-25)", score: 25, description: "Well-organized and fully developed. Clear thesis or purpose statement, strong topic sentences, supporting details are relevant and sufficient, logical transitions" },
          { id: "tc-l6", name: "Good (18-22)", score: 22, description: "Generally clear with minor gaps" },
          { id: "tc-l7", name: "Satisfactory (13-17)", score: 17, description: "Weak structure or limited development" },
          { id: "tc-l8", name: "Needs Improvement (0-12)", score: 12, description: "Disorganized or incomplete" },
        ],
      },
      {
        id: "tc-c3", name: "Source Use & Documentation", weight: 25,
        levels: [
          { id: "tc-l9", name: "Excellent (23-25)", score: 25, description: "Sources integrated smoothly and correctly. Credible and relevant sources used, accurate in-text citations, properly formatted references/works cited page, evidence is explained and connected to ideas" },
          { id: "tc-l10", name: "Good (18-22)", score: 22, description: "Minor citation or integration issues" },
          { id: "tc-l11", name: "Satisfactory (13-17)", score: 17, description: "Weak or inconsistent source use" },
          { id: "tc-l12", name: "Needs Improvement (0-12)", score: 12, description: "Missing, incorrect, or improperly used sources" },
        ],
      },
      {
        id: "tc-c4", name: "Technical Accuracy & Assignment Requirements", weight: 25,
        levels: [
          { id: "tc-l13", name: "Excellent (23-25)", score: 25, description: "All requirements fully met. Minimum word count met (300+ words), assignment instructions followed, plagiarism check passed, AI-use compliance (if applicable), clear summary or conclusion" },
          { id: "tc-l14", name: "Good (18-22)", score: 22, description: "One minor requirement issue" },
          { id: "tc-l15", name: "Satisfactory (13-17)", score: 17, description: "Multiple requirement issues" },
          { id: "tc-l16", name: "Needs Improvement (0-12)", score: 12, description: "Major requirements unmet" },
        ],
      },
    ],
  },
  four_year_college: {
    id: "4yr-essay",
    name: "4-Year College Research Paper Rubric",
    description: "Advanced rubric for undergraduate research paper evaluation. Total: 100 Points | Minimum Length: 600 Words",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "four_year_college",
    templateType: "essay",
    minimumLength: "600 words",
    latePolicy: { enabled: true, description: "24 hrs late: -10 pts | 48 hrs late: -20 pts | 72+ hrs late: zero unless documented exception" },
    revisionPolicy: { enabled: true, description: "One revision if score is below 85 | Maximum revised score: 85 | Revision due within 7 days" },
    criteria: [
      {
        id: "4yr-c1", name: "Writing Quality & Precision", weight: 25,
        levels: [
          { id: "4yr-l1", name: "Excellent (23-25)", score: 25, description: "Sophisticated sentence structure, minimal grammatical errors, academic tone and voice, precise word choice" },
          { id: "4yr-l2", name: "Good (18-22)", score: 22, description: "Clear writing with minor issues" },
          { id: "4yr-l3", name: "Satisfactory (13-17)", score: 17, description: "Acceptable writing with some problems" },
          { id: "4yr-l4", name: "Needs Improvement (0-12)", score: 12, description: "Unclear or poorly written" },
        ],
      },
      {
        id: "4yr-c2", name: "Organization & Argumentation", weight: 25,
        levels: [
          { id: "4yr-l5", name: "Excellent (23-25)", score: 25, description: "Clear, arguable thesis, logical paragraph sequencing, strong topic sentences, cohesive transitions" },
          { id: "4yr-l6", name: "Good (18-22)", score: 22, description: "Generally well-organized with minor gaps" },
          { id: "4yr-l7", name: "Satisfactory (13-17)", score: 17, description: "Some organizational issues present" },
          { id: "4yr-l8", name: "Needs Improvement (0-12)", score: 12, description: "Disorganized, hard to follow" },
        ],
      },
      {
        id: "4yr-c3", name: "Research Quality & Documentation", weight: 25,
        levels: [
          { id: "4yr-l9", name: "Excellent (23-25)", score: 25, description: "Scholarly/credible sources (minimum 4-6), accurate in-text citations (APA/MLA/Chicago), proper references page, evidence analyzed, not summarized" },
          { id: "4yr-l10", name: "Good (18-22)", score: 22, description: "Good range of sources, well-integrated" },
          { id: "4yr-l11", name: "Satisfactory (13-17)", score: 17, description: "Adequate sources, some integration issues" },
          { id: "4yr-l12", name: "Needs Improvement (0-12)", score: 12, description: "Limited sources or poor integration" },
        ],
      },
      {
        id: "4yr-c4", name: "Technical Accuracy & Compliance", weight: 25,
        levels: [
          { id: "4yr-l13", name: "Excellent (23-25)", score: 25, description: "Minimum word count met (600+ words), plagiarism check passed, AI-use policy followed, assignment objectives met, strong conclusion" },
          { id: "4yr-l14", name: "Good (18-22)", score: 22, description: "One minor requirement issue" },
          { id: "4yr-l15", name: "Satisfactory (13-17)", score: 17, description: "Multiple requirement issues" },
          { id: "4yr-l16", name: "Needs Improvement (0-12)", score: 12, description: "Major requirements unmet" },
        ],
      },
    ],
  },
  graduate: {
    id: "grad-essay",
    name: "Graduate Research Paper Rubric",
    description: "Scholarly rubric for graduate-level research paper evaluation. Total: 100 Points | Minimum Length: 1,000 Words",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "graduate",
    templateType: "essay",
    minimumLength: "1,000 words",
    latePolicy: { enabled: true, description: "Late submissions not accepted without prior approval. Documented exceptions only." },
    revisionPolicy: { enabled: true, description: "Revisions permitted at instructor discretion | Maximum revised score: 90 | Revision must substantially improve argument and analysis" },
    criteria: [
      {
        id: "grad-c1", name: "Scholarly Writing & Style", weight: 25,
        levels: [
          { id: "grad-l1", name: "Excellent (23-25)", score: 25, description: "Advanced academic tone, precision and clarity, discipline-appropriate language, minimal to no mechanical errors" },
          { id: "grad-l2", name: "Good (18-22)", score: 22, description: "Clear writing with minor issues" },
          { id: "grad-l3", name: "Satisfactory (13-17)", score: 17, description: "Acceptable writing with some problems" },
          { id: "grad-l4", name: "Needs Improvement (0-12)", score: 12, description: "Below graduate-level expectations" },
        ],
      },
      {
        id: "grad-c2", name: "Argumentation & Structure", weight: 25,
        levels: [
          { id: "grad-l5", name: "Excellent (23-25)", score: 25, description: "Clear, original research focus, logical and intentional organization, strong synthesis of ideas, effective transitions and framing" },
          { id: "grad-l6", name: "Good (18-22)", score: 22, description: "Generally well-organized with minor gaps" },
          { id: "grad-l7", name: "Satisfactory (13-17)", score: 17, description: "Some organizational issues present" },
          { id: "grad-l8", name: "Needs Improvement (0-12)", score: 12, description: "Lacks coherent structure" },
        ],
      },
      {
        id: "grad-c3", name: "Research Depth & Citation", weight: 25,
        levels: [
          { id: "grad-l9", name: "Excellent (23-25)", score: 25, description: "Peer-reviewed and scholarly sources, accurate citation formatting, strong synthesis of literature, critical engagement with sources" },
          { id: "grad-l10", name: "Good (18-22)", score: 22, description: "Good research with minor citation issues" },
          { id: "grad-l11", name: "Satisfactory (13-17)", score: 17, description: "Adequate sources, limited synthesis" },
          { id: "grad-l12", name: "Needs Improvement (0-12)", score: 12, description: "Insufficient research depth" },
        ],
      },
      {
        id: "grad-c4", name: "Academic Rigor & Compliance", weight: 25,
        levels: [
          { id: "grad-l13", name: "Excellent (23-25)", score: 25, description: "Minimum word count met (1,000+ words), plagiarism and originality verified, AI-use disclosures (if applicable), meets graduate-level expectations, insightful conclusion or implications" },
          { id: "grad-l14", name: "Good (18-22)", score: 22, description: "One minor requirement issue" },
          { id: "grad-l15", name: "Satisfactory (13-17)", score: 17, description: "Multiple requirement issues" },
          { id: "grad-l16", name: "Needs Improvement (0-12)", score: 12, description: "Major requirements unmet" },
        ],
      },
    ],
  },
};

const PRESENTATION_TEMPLATES: Record<EducationLevel, Rubric> = {
  middle_school: {
    id: "ms-pres",
    name: "Middle School Presentation Rubric",
    description: "Standard rubric for evaluating middle school presentations. Total: 100 Points | Time Target: 3-5 Minutes",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "middle_school",
    templateType: "presentation",
    timeLimit: "3-5 minutes",
    latePolicy: { enabled: true, description: "1 day late: -10 points | 2+ days late: teacher discretion" },
    revisionPolicy: { enabled: true, description: "One revision allowed (max score: 85)" },
    criteria: [
      {
        id: "ms-p1", name: "Content Design & Visual Aids", weight: 25,
        levels: [
          { id: "ms-pl1", name: "Excellent (23-25)", score: 25, description: "Clear, neat, and effective visuals. Text is readable, slides not overcrowded, use of images/charts, slides relate clearly to topic" },
          { id: "ms-pl2", name: "Good (18-22)", score: 22, description: "Mostly clear with minor issues" },
          { id: "ms-pl3", name: "Satisfactory (13-17)", score: 17, description: "Overcrowded or inconsistent" },
          { id: "ms-pl4", name: "Needs Improvement (0-12)", score: 12, description: "Visuals distract or confuse" },
        ],
      },
      {
        id: "ms-p2", name: "Delivery & Engagement", weight: 30,
        levels: [
          { id: "ms-pl5", name: "Excellent (27-30)", score: 30, description: "Confident and engaging. Voice is clear, appropriate pace, eye contact, limited filler words, demonstrates preparation" },
          { id: "ms-pl6", name: "Good (21-26)", score: 26, description: "Clear with some nervousness" },
          { id: "ms-pl7", name: "Satisfactory (15-20)", score: 20, description: "Limited engagement" },
          { id: "ms-pl8", name: "Needs Improvement (0-14)", score: 14, description: "Difficult to follow" },
        ],
      },
      {
        id: "ms-p3", name: "Time Management", weight: 15,
        levels: [
          { id: "ms-pl9", name: "Excellent (14-15)", score: 15, description: "Presentation fits within time range, content is balanced, clear beginning and ending" },
          { id: "ms-pl10", name: "Good (11-13)", score: 13, description: "Slightly over/under but well-paced" },
          { id: "ms-pl11", name: "Satisfactory (8-10)", score: 10, description: "Noticeable timing issues" },
          { id: "ms-pl12", name: "Needs Improvement (0-7)", score: 7, description: "Significantly over/under time" },
        ],
      },
      {
        id: "ms-p4", name: "Content Quality & Flow", weight: 30,
        levels: [
          { id: "ms-pl13", name: "Excellent (27-30)", score: 30, description: "Clear main idea or purpose, logical order of ideas, accurate and relevant information, clear conclusion" },
          { id: "ms-pl14", name: "Good (21-26)", score: 26, description: "Generally clear with minor gaps" },
          { id: "ms-pl15", name: "Satisfactory (15-20)", score: 20, description: "Some organizational issues" },
          { id: "ms-pl16", name: "Needs Improvement (0-14)", score: 14, description: "Disorganized or incomplete" },
        ],
      },
    ],
  },
  high_school: {
    id: "hs-pres",
    name: "High School Presentation Rubric",
    description: "Comprehensive rubric for high school presentation evaluation. Total: 100 Points | Time Target: 3-5 Minutes",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "high_school",
    templateType: "presentation",
    timeLimit: "3-5 minutes",
    latePolicy: { enabled: true, description: "1 day late: -10 points | 2+ days late: teacher discretion" },
    revisionPolicy: { enabled: true, description: "One revision allowed (max score: 85)" },
    criteria: [
      {
        id: "hs-p1", name: "Content Design & Visual Aids", weight: 25,
        levels: [
          { id: "hs-pl1", name: "Excellent (23-25)", score: 25, description: "Clear, neat, and effective visuals. Text readable (24-pt or larger), slides not overcrowded, use of images/charts/visuals, presenter does not read slides word-for-word" },
          { id: "hs-pl2", name: "Good (18-22)", score: 22, description: "Mostly clear with minor issues" },
          { id: "hs-pl3", name: "Satisfactory (13-17)", score: 17, description: "Overcrowded or inconsistent" },
          { id: "hs-pl4", name: "Needs Improvement (0-12)", score: 12, description: "Visuals distract or confuse" },
        ],
      },
      {
        id: "hs-p2", name: "Delivery & Engagement", weight: 30,
        levels: [
          { id: "hs-pl5", name: "Excellent (27-30)", score: 30, description: "Confident and engaging. Voice clear and understandable, appropriate speaking pace, eye contact with audience, limited filler words, demonstrates preparation" },
          { id: "hs-pl6", name: "Good (21-26)", score: 26, description: "Clear with some nervousness" },
          { id: "hs-pl7", name: "Satisfactory (15-20)", score: 20, description: "Limited engagement" },
          { id: "hs-pl8", name: "Needs Improvement (0-14)", score: 14, description: "Difficult to follow" },
        ],
      },
      {
        id: "hs-p3", name: "Time Management", weight: 15,
        levels: [
          { id: "hs-pl9", name: "Excellent (14-15)", score: 15, description: "Presentation fits within time range (plus/minus 1 minute allowed), content is balanced, clear beginning and ending" },
          { id: "hs-pl10", name: "Good (11-13)", score: 13, description: "Slightly over/under but well-paced" },
          { id: "hs-pl11", name: "Satisfactory (8-10)", score: 10, description: "Noticeable timing issues" },
          { id: "hs-pl12", name: "Needs Improvement (0-7)", score: 7, description: "Significantly over/under time" },
        ],
      },
      {
        id: "hs-p4", name: "Content Quality & Flow", weight: 30,
        levels: [
          { id: "hs-pl13", name: "Excellent (27-30)", score: 30, description: "Clear main idea or purpose, logical order of ideas, accurate and relevant information, clear conclusion" },
          { id: "hs-pl14", name: "Good (21-26)", score: 26, description: "Generally clear with minor gaps" },
          { id: "hs-pl15", name: "Satisfactory (15-20)", score: 20, description: "Some organizational issues" },
          { id: "hs-pl16", name: "Needs Improvement (0-14)", score: 14, description: "Disorganized or incomplete" },
        ],
      },
    ],
  },
  tech_college: {
    id: "tc-pres",
    name: "2-Year Technical College Presentation Rubric",
    description: "Professional rubric for technical college presentation evaluation. Total: 100 Points | Time Target: 3-5 Minutes",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "tech_college",
    templateType: "presentation",
    timeLimit: "3-5 minutes",
    latePolicy: { enabled: true, description: "Up to 24 hrs late: -10 points | 25-72 hrs late: -20 points" },
    revisionPolicy: { enabled: true, description: "One revision allowed if score <85 | Max revised score: 85" },
    criteria: [
      {
        id: "tc-p1", name: "Content Design & Visual Aids", weight: 25,
        levels: [
          { id: "tc-pl1", name: "Excellent (23-25)", score: 25, description: "Professional, readable slide design. Minimal text (bullet points only), effective use of visuals, consistent formatting, slides support - not replace - the speaker" },
          { id: "tc-pl2", name: "Good (18-22)", score: 22, description: "Mostly professional with minor issues" },
          { id: "tc-pl3", name: "Satisfactory (13-17)", score: 17, description: "Inconsistent or unprofessional elements" },
          { id: "tc-pl4", name: "Needs Improvement (0-12)", score: 12, description: "Unprofessional or distracting design" },
        ],
      },
      {
        id: "tc-p2", name: "Delivery & Engagement", weight: 30,
        levels: [
          { id: "tc-pl5", name: "Excellent (27-30)", score: 30, description: "Clear voice and steady pace, minimal filler words, eye contact or camera focus, professional posture and tone, engages audience through clarity and examples. Video: webcam on, good lighting, camera at eye level, no distractions" },
          { id: "tc-pl6", name: "Good (21-26)", score: 26, description: "Clear with minor delivery issues" },
          { id: "tc-pl7", name: "Satisfactory (15-20)", score: 20, description: "Limited engagement or professionalism" },
          { id: "tc-pl8", name: "Needs Improvement (0-14)", score: 14, description: "Difficult to follow or unprofessional" },
        ],
      },
      {
        id: "tc-p3", name: "Time Management", weight: 15,
        levels: [
          { id: "tc-pl9", name: "Excellent (14-15)", score: 15, description: "Stays within 3-5 minutes, smooth transitions, planned opening and closing" },
          { id: "tc-pl10", name: "Good (11-13)", score: 13, description: "Slightly over/under but well-paced" },
          { id: "tc-pl11", name: "Satisfactory (8-10)", score: 10, description: "Noticeable timing issues" },
          { id: "tc-pl12", name: "Needs Improvement (0-7)", score: 7, description: "Significantly over/under time" },
        ],
      },
      {
        id: "tc-p4", name: "Content Quality & Flow", weight: 30,
        levels: [
          { id: "tc-pl13", name: "Excellent (27-30)", score: 30, description: "Clear purpose or thesis, logical progression of ideas, appropriate depth for time limit, accurate relevant information, strong takeaway or conclusion" },
          { id: "tc-pl14", name: "Good (21-26)", score: 26, description: "Generally clear with minor gaps" },
          { id: "tc-pl15", name: "Satisfactory (15-20)", score: 20, description: "Some organizational issues" },
          { id: "tc-pl16", name: "Needs Improvement (0-14)", score: 14, description: "Disorganized or incomplete" },
        ],
      },
    ],
  },
  four_year_college: {
    id: "4yr-pres",
    name: "4-Year College Presentation Rubric",
    description: "Advanced rubric for undergraduate presentation evaluation. Total: 100 Points | Time Target: 3-5 Minutes",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "four_year_college",
    templateType: "presentation",
    timeLimit: "3-5 minutes",
    latePolicy: { enabled: true, description: "24 hrs late: -10 points | 48 hrs late: -20 points | 72+ hrs late: not accepted without approval" },
    revisionPolicy: { enabled: true, description: "One revision allowed (max score: 85)" },
    criteria: [
      {
        id: "4yr-p1", name: "Content Design & Visual Aids", weight: 25,
        levels: [
          { id: "4yr-pl1", name: "Excellent (23-25)", score: 25, description: "Clean, professional slide design. Minimal text with strategic visuals, high-quality images or data visuals, consistent layout and formatting, slides enhance comprehension" },
          { id: "4yr-pl2", name: "Good (18-22)", score: 22, description: "Mostly professional with minor issues" },
          { id: "4yr-pl3", name: "Satisfactory (13-17)", score: 17, description: "Inconsistent or unprofessional elements" },
          { id: "4yr-pl4", name: "Needs Improvement (0-12)", score: 12, description: "Unprofessional or distracting design" },
        ],
      },
      {
        id: "4yr-p2", name: "Delivery & Engagement", weight: 30,
        levels: [
          { id: "4yr-pl5", name: "Excellent (27-30)", score: 30, description: "Confident, professional delivery. Strong voice control and pacing, minimal filler words, sustained audience or camera engagement, purposeful gestures and posture. Video: proper lighting/framing, neutral/professional background, clear audio" },
          { id: "4yr-pl6", name: "Good (21-26)", score: 26, description: "Clear with minor delivery issues" },
          { id: "4yr-pl7", name: "Satisfactory (15-20)", score: 20, description: "Limited engagement or professionalism" },
          { id: "4yr-pl8", name: "Needs Improvement (0-14)", score: 14, description: "Difficult to follow or unprofessional" },
        ],
      },
      {
        id: "4yr-p3", name: "Time Management", weight: 15,
        levels: [
          { id: "4yr-pl9", name: "Excellent (14-15)", score: 15, description: "Strict adherence to time limits, well-paced delivery, strong opening and closing" },
          { id: "4yr-pl10", name: "Good (11-13)", score: 13, description: "Slightly over/under but well-paced" },
          { id: "4yr-pl11", name: "Satisfactory (8-10)", score: 10, description: "Noticeable timing issues" },
          { id: "4yr-pl12", name: "Needs Improvement (0-7)", score: 7, description: "Significantly over/under time" },
        ],
      },
      {
        id: "4yr-p4", name: "Content Quality & Flow", weight: 30,
        levels: [
          { id: "4yr-pl13", name: "Excellent (27-30)", score: 30, description: "Clear, arguable focus or thesis. Logical, cohesive structure, appropriate depth and analysis, accurate information, memorable conclusion" },
          { id: "4yr-pl14", name: "Good (21-26)", score: 26, description: "Generally clear with minor gaps" },
          { id: "4yr-pl15", name: "Satisfactory (15-20)", score: 20, description: "Some organizational issues" },
          { id: "4yr-pl16", name: "Needs Improvement (0-14)", score: 14, description: "Disorganized or incomplete" },
        ],
      },
    ],
  },
  graduate: {
    id: "grad-pres",
    name: "Graduate-Level Presentation Rubric",
    description: "Scholarly rubric for graduate-level presentation evaluation. Total: 100 Points | Time Target: 3-5 Minutes",
    isTemplate: true,
    totalPoints: 100,
    educationLevel: "graduate",
    templateType: "presentation",
    timeLimit: "3-5 minutes",
    latePolicy: { enabled: true, description: "Late presentations not accepted without prior approval" },
    revisionPolicy: { enabled: true, description: "Revisions allowed at instructor discretion only | Maximum revised score: 90" },
    criteria: [
      {
        id: "grad-p1", name: "Content Design & Visual Aids", weight: 25,
        levels: [
          { id: "grad-pl1", name: "Excellent (23-25)", score: 25, description: "Slides are minimal and intentional. Visuals support analysis or synthesis, no unnecessary text, professional discipline-appropriate design, slides enhance - not explain - the content" },
          { id: "grad-pl2", name: "Good (18-22)", score: 22, description: "Mostly professional with minor issues" },
          { id: "grad-pl3", name: "Satisfactory (13-17)", score: 17, description: "Inconsistent or unprofessional elements" },
          { id: "grad-pl4", name: "Needs Improvement (0-12)", score: 12, description: "Below graduate-level expectations" },
        ],
      },
      {
        id: "grad-p2", name: "Delivery & Engagement", weight: 30,
        levels: [
          { id: "grad-pl5", name: "Excellent (27-30)", score: 30, description: "Authoritative, polished delivery. Precise language and pacing, strong audience or camera presence, no distracting fillers, professional demeanor throughout. Video: high-quality lighting and audio, eye-level framing, distraction-free environment" },
          { id: "grad-pl6", name: "Good (21-26)", score: 26, description: "Clear with minor delivery issues" },
          { id: "grad-pl7", name: "Satisfactory (15-20)", score: 20, description: "Limited engagement or professionalism" },
          { id: "grad-pl8", name: "Needs Improvement (0-14)", score: 14, description: "Below graduate-level expectations" },
        ],
      },
      {
        id: "grad-p3", name: "Time Management", weight: 15,
        levels: [
          { id: "grad-pl9", name: "Excellent (14-15)", score: 15, description: "Strict adherence to time limit, efficient use of allotted time, purposeful transitions, clear impactful closing" },
          { id: "grad-pl10", name: "Good (11-13)", score: 13, description: "Slightly over/under but well-paced" },
          { id: "grad-pl11", name: "Satisfactory (8-10)", score: 10, description: "Noticeable timing issues" },
          { id: "grad-pl12", name: "Needs Improvement (0-7)", score: 7, description: "Significantly over/under time" },
        ],
      },
      {
        id: "grad-p4", name: "Content Quality & Flow", weight: 30,
        levels: [
          { id: "grad-pl13", name: "Excellent (27-30)", score: 30, description: "Clearly defined purpose or research focus. Logical, intentional structure, depth appropriate for graduate study, evidence of synthesis or insight, strong implications or takeaway" },
          { id: "grad-pl14", name: "Good (21-26)", score: 26, description: "Generally clear with minor gaps" },
          { id: "grad-pl15", name: "Satisfactory (15-20)", score: 20, description: "Some organizational issues" },
          { id: "grad-pl16", name: "Needs Improvement (0-14)", score: 14, description: "Below graduate-level expectations" },
        ],
      },
    ],
  },
};

interface CriterionCardProps {
  criterion: Criterion;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (criterion: Criterion) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

function CriterionCard({
  criterion,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
}: CriterionCardProps) {
  const [activeLevel, setActiveLevel] = useState(0);

  const handleNameChange = (name: string) => {
    onUpdate({ ...criterion, name });
  };

  const handleWeightChange = (weight: number) => {
    onUpdate({ ...criterion, weight: Math.max(1, Math.min(100, weight)) });
  };

  const handleLevelUpdate = (levelIndex: number, updates: Partial<ProficiencyLevel>) => {
    const newLevels = [...criterion.levels];
    newLevels[levelIndex] = { ...newLevels[levelIndex], ...updates };
    onUpdate({ ...criterion, levels: newLevels });
  };

  const handleAddLevel = () => {
    const newLevel: ProficiencyLevel = {
      id: generateId(),
      name: `Level ${criterion.levels.length + 1}`,
      score: 0,
      description: "",
    };
    onUpdate({ ...criterion, levels: [...criterion.levels, newLevel] });
    setActiveLevel(criterion.levels.length);
  };

  const handleRemoveLevel = (levelIndex: number) => {
    if (criterion.levels.length <= 1) return;
    const newLevels = criterion.levels.filter((_, i) => i !== levelIndex);
    onUpdate({ ...criterion, levels: newLevels });
    if (activeLevel >= newLevels.length) {
      setActiveLevel(Math.max(0, newLevels.length - 1));
    }
  };

  return (
    <Card
      className={`mb-4 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-[0.98]" : ""
      } ${isDropTarget ? "border-2 border-dashed border-primary" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      data-testid={`criterion-card-${index}`}
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="cursor-grab text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`drag-handle-${index}`}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <Input
              value={criterion.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-1 px-2 -mx-2"
              placeholder="Criterion name"
              data-testid={`input-criterion-name-${index}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Weight:</Label>
            <Input
              type="number"
              value={criterion.weight}
              onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
              className="w-20 text-center"
              min={1}
              max={100}
              data-testid={`input-criterion-weight-${index}`}
            />
            <span className="text-sm text-muted-foreground">pts</span>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleExpand}
                  data-testid={`button-expand-criterion-${index}`}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                  data-testid={`button-delete-criterion-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete criterion</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Proficiency Levels</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLevel}
                data-testid={`button-add-level-${index}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Level
              </Button>
            </div>

            <Tabs value={String(activeLevel)} onValueChange={(v) => setActiveLevel(parseInt(v))}>
              <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                {criterion.levels.map((level, levelIndex) => (
                  <TabsTrigger
                    key={level.id}
                    value={String(levelIndex)}
                    className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-level-${index}-${levelIndex}`}
                  >
                    {level.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {criterion.levels.map((level, levelIndex) => (
                <TabsContent key={level.id} value={String(levelIndex)} className="mt-4">
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`level-name-${index}-${levelIndex}`}>Level Name</Label>
                        <Input
                          id={`level-name-${index}-${levelIndex}`}
                          value={level.name}
                          onChange={(e) => handleLevelUpdate(levelIndex, { name: e.target.value })}
                          placeholder="e.g., Excellent, Good, Satisfactory"
                          data-testid={`input-level-name-${index}-${levelIndex}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`level-score-${index}-${levelIndex}`}>Score</Label>
                        <Input
                          id={`level-score-${index}-${levelIndex}`}
                          type="number"
                          value={level.score}
                          onChange={(e) =>
                            handleLevelUpdate(levelIndex, { score: Math.max(0, parseInt(e.target.value) || 0) })
                          }
                          min={0}
                          data-testid={`input-level-score-${index}-${levelIndex}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`level-desc-${index}-${levelIndex}`}>Description</Label>
                      <Textarea
                        id={`level-desc-${index}-${levelIndex}`}
                        value={level.description}
                        onChange={(e) => handleLevelUpdate(levelIndex, { description: e.target.value })}
                        placeholder="Describe what this proficiency level looks like..."
                        className="min-h-[100px] resize-none"
                        data-testid={`input-level-description-${index}-${levelIndex}`}
                      />
                    </div>
                    {criterion.levels.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLevel(levelIndex)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-level-${index}-${levelIndex}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Level
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </Card>
  );
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Rubric) => void;
}

function TemplateDialog({ open, onOpenChange, onSelectTemplate }: TemplateDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>("high_school");
  const [selectedType, setSelectedType] = useState<TemplateType>("essay");

  const currentTemplate = useMemo(() => {
    if (selectedType === "essay") {
      return ESSAY_TEMPLATES[selectedLevel];
    }
    return PRESENTATION_TEMPLATES[selectedLevel];
  }, [selectedLevel, selectedType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Import Template</DialogTitle>
          <DialogDescription>
            Select your education level and rubric type to get a pre-built template
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Education Level</Label>
            <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as EducationLevel)}>
              <SelectTrigger data-testid="select-education-level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value} data-testid={`option-level-${level.value}`}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Rubric Type</Label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as TemplateType)}>
              <SelectTrigger data-testid="select-template-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} data-testid={`option-type-${type.value}`}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {currentTemplate && (
            <Card className="p-4" data-testid="card-template-preview">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold" data-testid="text-template-name">{currentTemplate.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{currentTemplate.description}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="secondary">{currentTemplate.criteria.length} criteria</Badge>
                    <Badge variant="secondary">{currentTemplate.totalPoints} points</Badge>
                    {currentTemplate.minimumLength && (
                      <Badge variant="outline">Min: {currentTemplate.minimumLength}</Badge>
                    )}
                    {currentTemplate.timeLimit && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentTemplate.timeLimit}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Criteria Preview</h4>
                {currentTemplate.criteria.map((criterion, idx) => (
                  <div key={criterion.id} className="flex items-center justify-between text-sm py-1">
                    <span>{idx + 1}. {criterion.name}</span>
                    <Badge variant="outline">{criterion.weight} pts</Badge>
                  </div>
                ))}
              </div>

              {(currentTemplate.latePolicy?.enabled || currentTemplate.revisionPolicy?.enabled) && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Policies Included</h4>
                    {currentTemplate.latePolicy?.enabled && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Late Policy:</span> {currentTemplate.latePolicy.description}
                      </div>
                    )}
                    {currentTemplate.revisionPolicy?.enabled && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Revision Policy:</span> {currentTemplate.revisionPolicy.description}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-template-dialog">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (currentTemplate) {
                onSelectTemplate(currentTemplate);
                onOpenChange(false);
              }
            }}
            data-testid="button-import-selected-template"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CriteriaListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-9 h-9" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function RubricBuilder() {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const { toast } = useToast();
  
  const [rubric, setRubric] = useState<Rubric>(createDefaultRubric);
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set([rubric.criteria[0]?.id]));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const totalPoints = useMemo(() => 
    rubric.criteria.reduce((sum, c) => sum + c.weight, 0), 
    [rubric.criteria]
  );

  const { data: existingRubric, isLoading: isLoadingRubric } = useQuery<Rubric>({
    queryKey: ['/api/rubrics', params.id],
    enabled: !!params.id,
  });

  useEffect(() => {
    if (existingRubric) {
      setRubric(existingRubric);
      setExpandedCriteria(new Set([existingRubric.criteria[0]?.id]));
    }
  }, [existingRubric]);

  const saveMutation = useMutation({
    mutationFn: async (rubricData: Rubric) => {
      const { id, ...insertData } = rubricData;
      const dataToSend = { ...insertData, totalPoints };
      
      if (params.id) {
        return await apiRequest("PUT", `/api/rubrics/${params.id}`, dataToSend);
      }
      return await apiRequest("POST", "/api/rubrics", dataToSend);
    },
    onSuccess: async (response) => {
      const savedRubric = await response.json();
      setRubric(savedRubric);
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/rubrics'] });
      toast({
        title: "Rubric saved",
        description: `"${rubric.name}" has been saved successfully`,
      });
      if (!params.id) {
        navigate(`/rubric-builder/${savedRubric.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "There was an error saving your rubric. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRubricUpdate = useCallback((updates: Partial<Rubric>) => {
    setRubric((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const handleCriterionUpdate = useCallback((index: number, criterion: Criterion) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = criterion;
      return { ...prev, criteria: newCriteria };
    });
    setHasChanges(true);
  }, []);

  const handleCriterionDelete = useCallback((index: number) => {
    if (rubric.criteria.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "A rubric must have at least one criterion",
        variant: "destructive",
      });
      return;
    }
    setRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  }, [rubric.criteria.length, toast]);

  const handleAddCriterion = useCallback(() => {
    const newCriterion = createDefaultCriterion();
    setRubric((prev) => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion],
    }));
    setExpandedCriteria((prev) => new Set([...prev, newCriterion.id]));
    setHasChanges(true);
  }, []);

  const handleToggleExpand = useCallback((criterionId: string) => {
    setExpandedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(criterionId)) {
        next.delete(criterionId);
      } else {
        next.add(criterionId);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  }, [draggedIndex]);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      const [removed] = newCriteria.splice(draggedIndex, 1);
      newCriteria.splice(dropIndex, 0, removed);
      return { ...prev, criteria: newCriteria };
    });
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setHasChanges(true);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }, []);

  const handleImportTemplate = useCallback((template: Rubric) => {
    const newRubric: Rubric = {
      ...template,
      id: generateId(),
      name: `${template.name} (Copy)`,
      isTemplate: false,
      criteria: template.criteria.map((c) => ({
        ...c,
        id: generateId(),
        levels: c.levels.map((l) => ({ ...l, id: generateId() })),
      })),
    };
    setRubric(newRubric);
    setExpandedCriteria(new Set([newRubric.criteria[0]?.id]));
    setHasChanges(true);
    toast({
      title: "Template imported",
      description: `"${template.name}" has been loaded. Customize it as needed.`,
    });
  }, [toast]);

  const handleSave = useCallback(async () => {
    if (!rubric.name.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a name for your rubric",
        variant: "destructive",
      });
      return;
    }

    if (rubric.criteria.length === 0) {
      toast({
        title: "Validation error",
        description: "A rubric must have at least one criterion",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(rubric);
  }, [rubric, saveMutation, toast]);

  const handleExport = useCallback(() => {
    // Generate CSV content
    const rows: string[] = [];
    
    // Header row
    rows.push("Rubric Name,Description,Total Points,Education Level,Template Type,Minimum Length,Time Limit");
    rows.push(`"${rubric.name}","${rubric.description || ''}",${totalPoints},"${rubric.educationLevel || ''}","${rubric.templateType || ''}","${rubric.minimumLength || ''}","${rubric.timeLimit || ''}"`);
    rows.push("");
    
    // Late Policy
    if (rubric.latePolicy?.enabled) {
      rows.push("Late Policy");
      rows.push(`"${rubric.latePolicy.description || ''}"`);
      rows.push("");
    }
    
    // Revision Policy
    if (rubric.revisionPolicy?.enabled) {
      rows.push("Revision Policy");
      rows.push(`"${rubric.revisionPolicy.description || ''}"`);
      rows.push("");
    }
    
    // Criteria
    rows.push("Criteria");
    rows.push("Criterion Name,Weight (Points),Level Name,Level Score,Level Description");
    
    rubric.criteria.forEach((criterion) => {
      criterion.levels.forEach((level, levelIdx) => {
        if (levelIdx === 0) {
          rows.push(`"${criterion.name}",${criterion.weight},"${level.name}",${level.score},"${level.description}"`);
        } else {
          rows.push(`"","","${level.name}",${level.score},"${level.description}"`);
        }
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rubric.name.replace(/\s+/g, "-").toLowerCase()}-rubric.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Rubric exported",
      description: "Your rubric has been downloaded as a CSV file for Excel",
    });
  }, [rubric, totalPoints, toast]);

  const handleNewRubric = useCallback(() => {
    setRubric(createDefaultRubric());
    setExpandedCriteria(new Set());
    setHasChanges(false);
    navigate("/rubric-builder");
    toast({
      title: "New rubric created",
      description: "Start building your custom rubric from scratch",
    });
  }, [navigate, toast]);

  if (params.id && isLoadingRubric) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg">GraderInsight</span>
                <Separator orientation="vertical" className="h-6" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CriteriaListSkeleton />
            </div>
            <div className="lg:col-span-1">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg hidden sm:inline" data-testid="text-app-name">GraderInsight</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Input
                  value={rubric.name}
                  onChange={(e) => handleRubricUpdate({ name: e.target.value })}
                  className="text-xl font-semibold border-0 bg-transparent focus-visible:ring-1 max-w-md"
                  placeholder="Rubric name"
                  data-testid="input-rubric-name"
                />
                {hasChanges && (
                  <Badge variant="secondary" className="shrink-0" data-testid="badge-unsaved">Unsaved</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExport}
                    data-testid="button-export-rubric"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export rubric (CSV)</TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(true)}
                className="hidden sm:flex"
                data-testid="button-import-template"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Template
              </Button>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !hasChanges}
                data-testid="button-save-rubric"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saveMutation.isPending ? "Saving..." : "Save Rubric"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Label htmlFor="rubric-description">Description (optional)</Label>
              <Textarea
                id="rubric-description"
                value={rubric.description || ""}
                onChange={(e) => handleRubricUpdate({ description: e.target.value })}
                placeholder="Describe the purpose of this rubric..."
                className="mt-2 resize-none"
                rows={2}
                data-testid="input-rubric-description"
              />
            </div>

            {/* Minimum Length / Time Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="minimum-length">Minimum Length (for essays)</Label>
                <Input
                  id="minimum-length"
                  value={rubric.minimumLength || ""}
                  onChange={(e) => handleRubricUpdate({ minimumLength: e.target.value })}
                  placeholder="e.g., 500 words"
                  data-testid="input-minimum-length"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (for presentations)</Label>
                <Input
                  id="time-limit"
                  value={rubric.timeLimit || ""}
                  onChange={(e) => handleRubricUpdate({ timeLimit: e.target.value })}
                  placeholder="e.g., 3-5 minutes"
                  data-testid="input-time-limit"
                />
              </div>
            </div>

            {/* Policy Toggles */}
            <Card className="p-4 mb-6">
              <h3 className="text-sm font-medium mb-4">Policy Options</h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="late-policy"
                        checked={rubric.latePolicy?.enabled || false}
                        onCheckedChange={(checked) => 
                          handleRubricUpdate({ 
                            latePolicy: { 
                              enabled: checked, 
                              description: rubric.latePolicy?.description || "" 
                            } 
                          })
                        }
                        data-testid="switch-late-policy"
                      />
                      <Label htmlFor="late-policy" className="font-medium">Enable Late Policy</Label>
                    </div>
                    {rubric.latePolicy?.enabled && (
                      <Textarea
                        value={rubric.latePolicy.description || ""}
                        onChange={(e) => 
                          handleRubricUpdate({ 
                            latePolicy: { 
                              enabled: true, 
                              description: e.target.value 
                            } 
                          })
                        }
                        placeholder="e.g., 24 hrs late: -10 pts | 48 hrs late: -20 pts | 72+ hrs late: not accepted"
                        className="mt-2 resize-none text-sm"
                        rows={2}
                        data-testid="input-late-policy-description"
                      />
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="revision-policy"
                        checked={rubric.revisionPolicy?.enabled || false}
                        onCheckedChange={(checked) => 
                          handleRubricUpdate({ 
                            revisionPolicy: { 
                              enabled: checked, 
                              description: rubric.revisionPolicy?.description || "" 
                            } 
                          })
                        }
                        data-testid="switch-revision-policy"
                      />
                      <Label htmlFor="revision-policy" className="font-medium">Enable Revision Policy</Label>
                    </div>
                    {rubric.revisionPolicy?.enabled && (
                      <Textarea
                        value={rubric.revisionPolicy.description || ""}
                        onChange={(e) => 
                          handleRubricUpdate({ 
                            revisionPolicy: { 
                              enabled: true, 
                              description: e.target.value 
                            } 
                          })
                        }
                        placeholder="e.g., One revision allowed | Max score: 85 | Due within 7 days"
                        className="mt-2 resize-none text-sm"
                        rows={2}
                        data-testid="input-revision-policy-description"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold">Criteria</h2>
              <Badge variant="outline" className="text-muted-foreground" data-testid="badge-criteria-count">
                {rubric.criteria.length} {rubric.criteria.length === 1 ? "criterion" : "criteria"}
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-580px)]">
              <div className="pr-4">
                {rubric.criteria.map((criterion, index) => (
                  <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    index={index}
                    isExpanded={expandedCriteria.has(criterion.id)}
                    onToggleExpand={() => handleToggleExpand(criterion.id)}
                    onUpdate={(c) => handleCriterionUpdate(index, c)}
                    onDelete={() => handleCriterionDelete(index)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedIndex === index}
                    isDropTarget={dropTargetIndex === index}
                  />
                ))}

                <Button
                  variant="outline"
                  onClick={handleAddCriterion}
                  className="w-full border-dashed h-12"
                  data-testid="button-add-criterion"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Criterion
                </Button>
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6">
              <h3 className="text-lg font-semibold mb-4">Rubric Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Points</span>
                  <Badge variant="default" className="text-lg px-3 py-1" data-testid="badge-total-points">
                    {totalPoints}
                  </Badge>
                </div>

                {rubric.minimumLength && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Minimum Length</span>
                    <span className="font-medium">{rubric.minimumLength}</span>
                  </div>
                )}

                {rubric.timeLimit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time Limit</span>
                    <span className="font-medium">{rubric.timeLimit}</span>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Point Distribution</h4>
                  <div className="space-y-2">
                    {rubric.criteria.map((criterion) => (
                      <div key={criterion.id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-2">{criterion.name}</span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {criterion.weight} pts ({totalPoints > 0 ? Math.round((criterion.weight / totalPoints) * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(rubric.latePolicy?.enabled || rubric.revisionPolicy?.enabled) && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Policies</h4>
                      <div className="space-y-1">
                        {rubric.latePolicy?.enabled && (
                          <Badge variant="outline" className="mr-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Late Policy
                          </Badge>
                        )}
                        {rubric.revisionPolicy?.enabled && (
                          <Badge variant="outline">
                            <FileCheck className="w-3 h-3 mr-1" />
                            Revision Policy
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions for Rubrics</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={handleNewRubric}
                      data-testid="button-new-rubric"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Rubric
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => setShowTemplateDialog(true)}
                      data-testid="button-quick-import"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={handleExport}
                      data-testid="button-quick-export"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <TemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelectTemplate={handleImportTemplate}
      />
    </div>
  );
}
