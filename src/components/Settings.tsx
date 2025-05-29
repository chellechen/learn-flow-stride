
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Palette, Type, Clock } from 'lucide-react';
import { UserPreferences } from '@/types/lesson';

interface SettingsProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

const Settings = ({ preferences, onPreferencesChange }: SettingsProps) => {
  const handleThemeChange = (theme: 'light' | 'dark') => {
    onPreferencesChange({ ...preferences, theme });
  };

  const handleChunkSizeChange = (value: number[]) => {
    onPreferencesChange({ ...preferences, chunkSize: value[0] });
  };

  const handleFontSizeChange = (value: number[]) => {
    onPreferencesChange({ ...preferences, fontSize: value[0] });
  };

  const handleAutoAdvanceChange = (autoAdvance: boolean) => {
    onPreferencesChange({ ...preferences, autoAdvance });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </CardTitle>
          <CardDescription>
            Customize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <Label className="text-base font-medium">Theme</Label>
            </div>
            <Select value={preferences.theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chunk Size Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label className="text-base font-medium">Chunk Size</Label>
              </div>
              <span className="text-sm text-gray-600">{preferences.chunkSize} words</span>
            </div>
            <Slider
              value={[preferences.chunkSize]}
              onValueChange={handleChunkSizeChange}
              min={10}
              max={30}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Adjust the number of words per typing chunk (10-30 words)
            </p>
          </div>

          {/* Font Size Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label className="text-base font-medium">Font Size</Label>
              </div>
              <span className="text-sm text-gray-600">{preferences.fontSize}px</span>
            </div>
            <Slider
              value={[preferences.fontSize]}
              onValueChange={handleFontSizeChange}
              min={16}
              max={24}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Adjust the font size for typing exercises (16-24px)
            </p>
          </div>

          {/* Auto Advance Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="text-base font-medium">Auto Advance</Label>
              </div>
              <p className="text-sm text-gray-500">
                Automatically move to the next chunk when completed
              </p>
            </div>
            <Switch
              checked={preferences.autoAdvance}
              onCheckedChange={handleAutoAdvanceChange}
            />
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings affect the typing experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`p-4 rounded-lg border-2 ${
              preferences.theme === 'dark' 
                ? 'bg-gray-900 text-white border-gray-700' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}
            style={{ fontSize: `${preferences.fontSize}px` }}
          >
            <p className="font-mono leading-relaxed">
              This is how your typing text will appear with your current settings. 
              The font size is {preferences.fontSize}px and chunks will contain approximately {preferences.chunkSize} words each.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
