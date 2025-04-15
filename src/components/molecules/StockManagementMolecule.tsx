import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Briefcase } from 'lucide-react';

interface ManagementPerson {
  name: string;
  designation: string;
}

interface StockManagementMoleculeProps {
  managementJson: string | null | undefined;
  isLoading: boolean;
}

const parseManagementJson = (jsonString: string | null | undefined): ManagementPerson[] | null => {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation: check if it's an array and items have name/designation
    if (Array.isArray(parsed) && parsed.every(item => typeof item.name === 'string' && typeof item.designation === 'string')) {
      return parsed as ManagementPerson[];
    }
    console.error("Invalid management JSON structure:", parsed);
    return null;
  } catch (error) {
    console.error("Error parsing management JSON:", error);
    return null;
  }
};

const StockManagementMolecule: React.FC<StockManagementMoleculeProps> = ({ managementJson, isLoading }) => {
  const managementTeam = parseManagementJson(managementJson);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!managementTeam || managementTeam.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Management information unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Management Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {managementTeam.map((person, index) => (
          <div key={index} className="flex items-start space-x-3">
            <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Briefcase className="h-3 w-3 mr-1" /> {person.designation}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StockManagementMolecule; 