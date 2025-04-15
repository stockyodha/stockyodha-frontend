import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';

// Interfaces for the parsed address data
interface AddressDetail {
  City?: string;
  Email?: string;
  State?: string;
  Address?: string;
  FaxNo?: string;
  Internet?: string;
  PinCode?: string;
  TelNo?: string;
}

interface ParsedAddresses {
  registrars?: AddressDetail;
  registered_office?: AddressDetail;
}

interface StockAddressesMoleculeProps {
  addressesJson: string | null | undefined;
  isLoading: boolean;
}

// Helper function to parse the JSON string
const parseAddressesJson = (jsonString: string | null | undefined): ParsedAddresses | null => {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation (check if it's an object)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ParsedAddresses;
    }
    console.error("Invalid addresses JSON structure:", parsed);
    return null;
  } catch (error) {
    console.error("Error parsing addresses JSON:", error);
    return null;
  }
};

// Helper component to render a single address block
const AddressBlock: React.FC<{ title: string; details: AddressDetail | undefined }> = ({ title, details }) => {
  if (!details) return null;

  const fullAddress = [
    details.Address,
    details.City,
    details.State,
    details.PinCode,
  ].filter(Boolean).join(', ');

  return (
    <div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        {fullAddress && (
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{fullAddress}</span>
          </div>
        )}
        {details.TelNo && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <span>{details.TelNo}</span>
          </div>
        )}
        {details.Email && (
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <a href={`mailto:${details.Email}`} className="hover:text-primary hover:underline break-all">
              {details.Email}
            </a>
          </div>
        )}
        {details.Internet && (
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            <a href={details.Internet} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline break-all">
              {details.Internet}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


const StockAddressesMolecule: React.FC<StockAddressesMoleculeProps> = ({ addressesJson, isLoading }) => {
  const addresses = parseAddressesJson(addressesJson);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
           <Skeleton className="h-6 w-1/3" />
         </CardHeader>
         <CardContent className="space-y-5">
           {/* Skeleton for one address block */}
           <div>
             <Skeleton className="h-5 w-1/4 mb-3" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
               <Skeleton className="h-4 w-3/4" />
             </div>
           </div>
           {/* Skeleton for second address block */}
           <div>
             <Skeleton className="h-5 w-1/3 mb-3" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-1/2" />
             </div>
           </div>
         </CardContent>
      </Card>
    );
  }

  if (!addresses || (!addresses.registrars && !addresses.registered_office)) {
    return (
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Contact Information</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-muted-foreground text-sm">Address information unavailable.</p>
         </CardContent>
       </Card>
    );
  }

  return (
    <Card>
       <CardHeader>
         <CardTitle className="text-lg">Contact Information</CardTitle>
       </CardHeader>
       <CardContent className="space-y-5">
         {addresses.registered_office && (
           <AddressBlock title="Registered Office" details={addresses.registered_office} />
         )}
         {addresses.registrars && (
           <AddressBlock title="Registrars" details={addresses.registrars} />
         )}
       </CardContent>
    </Card>
  );
};

export default StockAddressesMolecule; 