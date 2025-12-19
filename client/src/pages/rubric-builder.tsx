import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, GripVertical, Trash2, ChevronDown, ChevronUp, FileText, Download, Upload, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Rubric, Criterion, ProficiencyLevel } from "@shared/schema";

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
    weight: 10,
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
  };
}

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

const SAMPLE_TEMPLATES: Rubric[] = [
  {
    id: "template-1",
    name: "Essay Writing Rubric",
    description: "Standard rubric for evaluating essay writing assignments",
    isTemplate: true,
    totalPoints: 100,
    criteria: [
      {
        id: "c1",
        name: "Thesis & Argument",
        weight: 25,
        levels: [
          { id: "l1", name: "Excellent", score: 25, description: "Clear, compelling thesis with strong argumentative support" },
          { id: "l2", name: "Good", score: 20, description: "Clear thesis with adequate support" },
          { id: "l3", name: "Satisfactory", score: 15, description: "Thesis present but needs stronger support" },
          { id: "l4", name: "Needs Improvement", score: 10, description: "Thesis unclear or missing" },
        ],
      },
      {
        id: "c2",
        name: "Organization & Structure",
        weight: 25,
        levels: [
          { id: "l5", name: "Excellent", score: 25, description: "Logical flow, clear transitions, well-structured paragraphs" },
          { id: "l6", name: "Good", score: 20, description: "Generally well-organized with minor issues" },
          { id: "l7", name: "Satisfactory", score: 15, description: "Some organizational issues present" },
          { id: "l8", name: "Needs Improvement", score: 10, description: "Disorganized, hard to follow" },
        ],
      },
      {
        id: "c3",
        name: "Evidence & Analysis",
        weight: 25,
        levels: [
          { id: "l9", name: "Excellent", score: 25, description: "Strong evidence with insightful analysis" },
          { id: "l10", name: "Good", score: 20, description: "Good evidence with adequate analysis" },
          { id: "l11", name: "Satisfactory", score: 15, description: "Some evidence, limited analysis" },
          { id: "l12", name: "Needs Improvement", score: 10, description: "Little or no evidence" },
        ],
      },
      {
        id: "c4",
        name: "Grammar & Mechanics",
        weight: 25,
        levels: [
          { id: "l13", name: "Excellent", score: 25, description: "Virtually error-free writing" },
          { id: "l14", name: "Good", score: 20, description: "Few errors that don't impede understanding" },
          { id: "l15", name: "Satisfactory", score: 15, description: "Some errors that occasionally impede understanding" },
          { id: "l16", name: "Needs Improvement", score: 10, description: "Many errors that impede understanding" },
        ],
      },
    ],
  },
  {
    id: "template-2",
    name: "Research Paper Rubric",
    description: "Comprehensive rubric for research paper evaluation",
    isTemplate: true,
    totalPoints: 100,
    criteria: [
      {
        id: "r1",
        name: "Research Quality",
        weight: 30,
        levels: [
          { id: "rl1", name: "Excellent", score: 30, description: "Extensive, high-quality sources properly integrated" },
          { id: "rl2", name: "Good", score: 24, description: "Good range of sources, well-integrated" },
          { id: "rl3", name: "Satisfactory", score: 18, description: "Adequate sources, some integration issues" },
          { id: "rl4", name: "Needs Improvement", score: 12, description: "Limited sources or poor integration" },
        ],
      },
      {
        id: "r2",
        name: "Critical Analysis",
        weight: 30,
        levels: [
          { id: "rl5", name: "Excellent", score: 30, description: "Deep, original analysis demonstrating mastery" },
          { id: "rl6", name: "Good", score: 24, description: "Solid analysis with good insights" },
          { id: "rl7", name: "Satisfactory", score: 18, description: "Basic analysis present" },
          { id: "rl8", name: "Needs Improvement", score: 12, description: "Minimal or superficial analysis" },
        ],
      },
      {
        id: "r3",
        name: "Citation & Formatting",
        weight: 20,
        levels: [
          { id: "rl9", name: "Excellent", score: 20, description: "Perfect citation format, professional layout" },
          { id: "rl10", name: "Good", score: 16, description: "Minor citation errors, good formatting" },
          { id: "rl11", name: "Satisfactory", score: 12, description: "Some citation and formatting issues" },
          { id: "rl12", name: "Needs Improvement", score: 8, description: "Major citation or formatting problems" },
        ],
      },
      {
        id: "r4",
        name: "Writing Quality",
        weight: 20,
        levels: [
          { id: "rl13", name: "Excellent", score: 20, description: "Clear, engaging, professional prose" },
          { id: "rl14", name: "Good", score: 16, description: "Clear writing with minor issues" },
          { id: "rl15", name: "Satisfactory", score: 12, description: "Acceptable writing with some problems" },
          { id: "rl16", name: "Needs Improvement", score: 8, description: "Unclear or poorly written" },
        ],
      },
    ],
  },
  {
    id: "template-3",
    name: "Presentation Rubric",
    description: "Evaluate oral presentations and slideshows",
    isTemplate: true,
    totalPoints: 50,
    criteria: [
      {
        id: "p1",
        name: "Content Knowledge",
        weight: 15,
        levels: [
          { id: "pl1", name: "Excellent", score: 15, description: "Deep understanding, handles questions expertly" },
          { id: "pl2", name: "Good", score: 12, description: "Good understanding, answers most questions" },
          { id: "pl3", name: "Satisfactory", score: 9, description: "Basic understanding demonstrated" },
          { id: "pl4", name: "Needs Improvement", score: 6, description: "Limited understanding evident" },
        ],
      },
      {
        id: "p2",
        name: "Delivery & Engagement",
        weight: 15,
        levels: [
          { id: "pl5", name: "Excellent", score: 15, description: "Confident, engaging, excellent eye contact" },
          { id: "pl6", name: "Good", score: 12, description: "Clear delivery, good audience engagement" },
          { id: "pl7", name: "Satisfactory", score: 9, description: "Adequate delivery, some engagement" },
          { id: "pl8", name: "Needs Improvement", score: 6, description: "Reads from notes, minimal engagement" },
        ],
      },
      {
        id: "p3",
        name: "Visual Aids",
        weight: 10,
        levels: [
          { id: "pl9", name: "Excellent", score: 10, description: "Professional, enhances presentation" },
          { id: "pl10", name: "Good", score: 8, description: "Clear and helpful visuals" },
          { id: "pl11", name: "Satisfactory", score: 6, description: "Basic visuals, could be improved" },
          { id: "pl12", name: "Needs Improvement", score: 4, description: "Poor or distracting visuals" },
        ],
      },
      {
        id: "p4",
        name: "Time Management",
        weight: 10,
        levels: [
          { id: "pl13", name: "Excellent", score: 10, description: "Perfect timing, well-paced throughout" },
          { id: "pl14", name: "Good", score: 8, description: "Slightly over/under but well-paced" },
          { id: "pl15", name: "Satisfactory", score: 6, description: "Noticeable timing issues" },
          { id: "pl16", name: "Needs Improvement", score: 4, description: "Significantly over/under time" },
        ],
      },
    ],
  },
];

function TemplateDialog({ open, onOpenChange, onSelectTemplate }: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Import Template</DialogTitle>
          <DialogDescription>
            Choose a pre-built rubric template to get started quickly
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {SAMPLE_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() => {
                  onSelectTemplate(template);
                  onOpenChange(false);
                }}
                data-testid={`card-template-${template.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold" data-testid={`text-template-name-${template.id}`}>{template.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{template.criteria.length} criteria</Badge>
                      <Badge variant="secondary">{template.totalPoints} points</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-template-dialog">
            Cancel
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
    const exportData = { ...rubric, totalPoints };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rubric.name.replace(/\s+/g, "-").toLowerCase()}-rubric.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Rubric exported",
      description: "Your rubric has been downloaded as a JSON file",
    });
  }, [rubric, totalPoints, toast]);

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
                <TooltipContent>Export rubric</TooltipContent>
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

            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold">Criteria</h2>
              <Badge variant="outline" className="text-muted-foreground" data-testid="badge-criteria-count">
                {rubric.criteria.length} {rubric.criteria.length === 1 ? "criterion" : "criteria"}
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-360px)]">
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
                  <span className="text-muted-foreground">Total Criteria</span>
                  <span className="font-semibold" data-testid="text-total-criteria">{rubric.criteria.length}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-total-points">
                      {totalPoints}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Point Distribution</h4>
                  {rubric.criteria.map((criterion, index) => (
                    <div key={criterion.id} className="flex items-center justify-between text-sm gap-2" data-testid={`text-distribution-${index}`}>
                      <span className="truncate max-w-[140px]">{criterion.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${totalPoints > 0 ? (criterion.weight / totalPoints) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{criterion.weight} pts</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateDialog(true)}
                      className="w-full"
                      data-testid="button-quick-import"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="w-full"
                      data-testid="button-quick-export"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
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