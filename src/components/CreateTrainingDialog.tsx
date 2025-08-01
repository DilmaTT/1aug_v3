import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRangeContext } from "@/contexts/RangeContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTraining: (training: any) => void;
}

export const CreateTrainingDialog = ({ open, onOpenChange, onCreateTraining }: CreateTrainingDialogProps) => {
  const [name, setName] = useState("");
  const [trainingType, setTrainingType] = useState<"classic" | "border-repeat">("classic");
  const [classicSubtype, setClassicSubtype] = useState<"all-hands" | "border-check">("all-hands");
  const [borderExpansionLevel, setBorderExpansionLevel] = useState<0 | 1 | 2>(0);
  const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
  
  const { folders } = useRangeContext();

  const hasRanges = folders.some(folder => folder.ranges.length > 0);

  const handleRangeToggle = (rangeId: string) => {
    setSelectedRanges(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const handleCreate = () => {
    if (!name.trim() || selectedRanges.length === 0 || !hasRanges) return;

    const training = {
      id: Date.now().toString(),
      name: name.trim(),
      type: trainingType,
      subtype: trainingType === 'classic' ? classicSubtype : undefined,
      borderExpansionLevel: trainingType === 'classic' && classicSubtype === 'border-check' 
        ? borderExpansionLevel 
        : undefined,
      ranges: selectedRanges,
      createdAt: new Date(),
      stats: null
    };

    onCreateTraining(training);
    
    // Reset form
    setName("");
    setTrainingType("classic");
    setClassicSubtype("all-hands");
    setBorderExpansionLevel(0);
    setSelectedRanges([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        mobileFullscreen={true}
        className="flex flex-col"
      >
        <DialogHeader className="relative -top-2 flex-shrink-0">
          <DialogTitle>Создать тренировку</DialogTitle>
        </DialogHeader>

        {/* Main content wrapper */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Name Input */}
          <div className="space-y-2 mt-1 flex-shrink-0">
            <Input
              id="training-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название тренировки"
              className="h-8"
            />
          </div>

          {/* Scrollable wrapper */}
          <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-y-auto py-2">
            
            {/* Вид тренировки */}
            <div className="space-y-3">
              <Label className="block w-full text-center">Вид тренировки</Label>
              <RadioGroup value={trainingType} onValueChange={(value: any) => setTrainingType(value)}>
                <div className="flex flex-wrap gap-x-6 gap-y-3 space-y-0">
                  <div className="flex items-center space-x-2 order-1">
                    <RadioGroupItem value="classic" id="classic" />
                    <Label htmlFor="classic" className="font-medium">Классическая</Label>
                  </div>
                  
                  {trainingType === "classic" && (
                    <div className="order-3 w-full ml-0 pt-0 space-y-3">
                      <RadioGroup value={classicSubtype} onValueChange={(value: any) => setClassicSubtype(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all-hands" id="all-hands" />
                          <Label htmlFor="all-hands">Все руки</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="border-check" id="border-check" />
                            <Label htmlFor="border-check">Граница ренжа</Label>
                          </div>

                          {classicSubtype === 'border-check' && (
                            <div className="pl-8 pt-2">
                              <Label className="text-xs font-normal text-muted-foreground">Уровень расширения</Label>
                              <RadioGroup 
                                value={String(borderExpansionLevel)} 
                                onValueChange={(value) => setBorderExpansionLevel(Number(value) as 0 | 1 | 2)}
                                className="flex items-center gap-x-4 pt-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="0" id="level-0" />
                                  <Label htmlFor="level-0" className="font-normal cursor-pointer">0</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="1" id="level-1" />
                                  <Label htmlFor="level-1" className="font-normal cursor-pointer">+1</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="2" id="level-2" />
                                  <Label htmlFor="level-2" className="font-normal cursor-pointer">+2</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 order-2">
                    <RadioGroupItem value="border-repeat" id="border-repeat" />
                    <Label htmlFor="border-repeat" className="font-medium">Повторение границ</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Выбор ренжей */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <Label>Выберите ренжи для тренировки</Label>
              {!hasRanges ? (
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Создайте хотя бы 1 ренж чтобы создать тренировку
                  </p>
                </Card>
              ) : (
                <Accordion 
                  type="multiple" 
                  className="w-full pr-2 flex-1 overflow-y-auto"
                >
                  {folders.map((folder) =>
                    folder.ranges.length > 0 ? (
                      <AccordionItem value={folder.id} key={folder.id}>
                        <AccordionTrigger className="py-2 hover:no-underline">
                          {folder.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2 pl-4">
                            {folder.ranges.map((range) => (
                              <div key={range.id} className="flex items-center space-x-3">
                                <Checkbox
                                  id={range.id}
                                  checked={selectedRanges.includes(range.id)}
                                  onCheckedChange={() => handleRangeToggle(range.id)}
                                />
                                <Label htmlFor={range.id} className="text-sm font-normal cursor-pointer">
                                  {range.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : null
                  )}
                </Accordion>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 mt-auto flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!name.trim() || selectedRanges.length === 0 || !hasRanges}
              variant="poker"
            >
              Создать тренировку
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
