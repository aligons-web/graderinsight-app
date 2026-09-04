import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, ArrowLeft, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthToken } from "@/lib/api";

interface RubricCriterion {
  id: string;
  criterion_name: string;
  criterion_description: string;
  max_points: number;
  order_position: number;
  scoring_guide: Array<{ range: string; description: string }>;
}

interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  rubric_type: string;
  academic_level: string;
  total_points: number;
  rubric_criteria: RubricCriterion[];
  is_template: boolean;
}

export default function RubricBuilder() {
  const [, params] = useRoute("/rubric-templates/:id");
  const [, setLocation] = useLocation();
  const rubricId = params?.id === "new" ? undefined : params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rubricName, setRubricName] = useState("");
  const [rubricDescription, setRubricDescription] = useState("");
  const [rubricType, setRubricType] = useState("essay");
  const [academicLevel, setAcademicLevel] = useState("high_school");
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Fetch existing rubric if editing
  const { data: existingRubric, isLoading: isLoadingRubric } = useQuery({
    queryKey: ['/api/rubric-templates', rubricId],
    queryFn: async () => {
      if (!rubricId) return null;
      const response = await fetch(`/api/rubric-templates/${rubricId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rubric');
      const data = await response.json();
      return data.template;
    },
    enabled: !!rubricId,
  });

  // Fetch templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/rubric-templates'],
    queryFn: async () => {
      const response = await fetch('/api/rubric-templates?limit=100', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      return data.templates || [];
    },
  });

  // Load existing rubric data
  useEffect(() => {
    if (existingRubric) {
      setRubricName(existingRubric.name || "");
      setRubricDescription(existingRubric.description || "");
      setRubricType(existingRubric.rubric_type || "essay");
      setAcademicLevel(existingRubric.academic_level || "high_school");
      setCriteria(existingRubric.rubric_criteria || []);
    }
  }, [existingRubric]);

  // Create rubric mutation
  const createRubric = useMutation({
    mutationFn: async (rubricData: any) => {
      const response = await fetch(rubricId ? `/api/rubric-templates/${rubricId}` : '/api/rubric-templates', {
        method: rubricId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(rubricData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create rubric');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: rubricId ? "Rubric updated successfully" : "Rubric created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rubric-templates'] });
      setLocation('/rubric-templates');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: `criterion-${Date.now()}`,
      criterion_name: "",
      criterion_description: "",
      max_points: 10,
      order_position: criteria.length,
      scoring_guide: [
        { range: "9-10", description: "Excellent" },
        { range: "7-8", description: "Good" },
        { range: "5-6", description: "Satisfactory" },
        { range: "0-4", description: "Needs Improvement" },
      ],
    };
    setCriteria([...criteria, newCriterion]);
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const loadTemplate = (template: RubricTemplate) => {
    setRubricName(template.name);
    setRubricDescription(template.description || "");
    setRubricType(template.rubric_type);
    setAcademicLevel(template.academic_level);
    setCriteria(template.rubric_criteria.map((c, index) => ({
      ...c,
      id: `criterion-${Date.now()}-${index}`,
      order_position: index,
    })));
    setShowTemplates(false);
    toast({
      title: "Template loaded",
      description: `Loaded "${template.name}" template`,
    });
  };

  const handleSave = () => {
    if (!rubricName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a rubric name",
        variant: "destructive",
      });
      return;
    }

    if (criteria.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one criterion",
        variant: "destructive",
      });
      return;
    }

    const totalPoints = criteria.reduce((sum, c) => sum + c.max_points, 0);

    const rubricData = {
      name: rubricName,
      description: rubricDescription,
      rubric_type: rubricType,
      academic_level: academicLevel,
      total_points: totalPoints,
      criteria: criteria.map((c, index) => ({
        criterion_name: c.criterion_name,
        criterion_description: c.criterion_description,
        max_points: c.max_points,
        order_position: index,
        scoring_guide: c.scoring_guide,
      })),
      late_policies: [],
      revision_policy: null,
    };

    createRubric.mutate(rubricData);
  };

  if (isLoadingRubric && rubricId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/rubric-templates')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
               {rubricId ? 'Edit Rubric Template' : 'Create Rubric Template'}
            </h1>
            <p className="text-muted-foreground">
               {rubricId ? 'Modify your reusable grading template' : 'Build a reusable grading template'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>
                  Start with a pre-built rubric template
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={rubricType} onValueChange={setRubricType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Academic Level</Label>
                    <Select value={academicLevel} onValueChange={setAcademicLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="middle_school">Middle School</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="tech_college">2-Year College</SelectItem>
                        <SelectItem value="four_year_college">4-Year College</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Templates List */}
                {isLoadingTemplates ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : templates && templates.length > 0 ? (
                  <div className="space-y-3">
                    {templates.map((template: RubricTemplate) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => loadTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{template.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  Template
                                </Badge>
                              </div>
                              {template.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                              )}
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>{template.rubric_criteria?.length || 0} criteria</span>
                                <span>{template.total_points} points</span>
                                <span className="capitalize">
                                  {template.rubric_type.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No templates found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try different filters
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={createRubric.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {createRubric.isPending ? 'Saving...' : 'Save Rubric'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General details about your rubric</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rubric-name">Rubric Name *</Label>
            <Input
              id="rubric-name"
              placeholder="e.g., High School Essay Rubric"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="rubric-description">Description</Label>
            <Textarea
              id="rubric-description"
              placeholder="Describe what this rubric is for..."
              value={rubricDescription}
              onChange={(e) => setRubricDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rubric-type">Type</Label>
              <Select value={rubricType} onValueChange={setRubricType}>
                <SelectTrigger id="rubric-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academic-level">Academic Level</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger id="academic-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle_school">Middle School</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="tech_college">2-Year College</SelectItem>
                  <SelectItem value="four_year_college">4-Year College</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grading Criteria</CardTitle>
              <CardDescription>
                Define the criteria for evaluating assignments
              </CardDescription>
            </div>
            <Button onClick={addCriterion} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {criteria.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No criteria added yet</p>
              <Button onClick={addCriterion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Criterion
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {criteria.map((criterion, index) => (
                <Card key={criterion.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Criterion {index + 1}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Criterion Name *</Label>
                      <Input
                        placeholder="e.g., Writing Quality & Clarity"
                        value={criterion.criterion_name}
                        onChange={(e) =>
                          updateCriterion(index, "criterion_name", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe what you're evaluating..."
                        value={criterion.criterion_description}
                        onChange={(e) =>
                          updateCriterion(index, "criterion_description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Maximum Points *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={criterion.max_points}
                        onChange={(e) =>
                          updateCriterion(index, "max_points", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Points</span>
                <span className="text-2xl font-bold">
                  {criteria.reduce((sum, c) => sum + c.max_points, 0)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setLocation('/rubric-templates')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={createRubric.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {createRubric.isPending ? 'Saving...' : 'Save Rubric'}
        </Button>
      </div>
    </div>
  );
}