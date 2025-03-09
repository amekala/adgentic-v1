
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { storeAmazonAdsTokens } from '@/integrations/supabase/client';

export default function SaveAmazonTokens() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accessToken: '',
    refreshToken: '',
    profileId: '',
    advertiserId: '123e4567-e89b-12d3-a456-426614174000' // Default test advertiser ID
  });
  const [success, setSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await storeAmazonAdsTokens({
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken,
        profileId: formData.profileId,
        advertiserId: formData.advertiserId,
        expiresIn: 3600 // 1 hour
      });
      
      setSuccess(result.success);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Amazon Ads tokens have been saved successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save tokens",
          variant: "destructive"
        });
      }
    } catch (error) {
      setSuccess(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Save Amazon Ads API Tokens</CardTitle>
          <CardDescription>
            Use this form to manually save Amazon Ads API tokens to your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessToken" className="text-sm font-medium">
                Access Token
              </label>
              <Input
                id="accessToken"
                name="accessToken"
                value={formData.accessToken}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="Atza|IwEBIL..."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="refreshToken" className="text-sm font-medium">
                Refresh Token
              </label>
              <Input
                id="refreshToken"
                name="refreshToken"
                value={formData.refreshToken}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="Atzr|IwEBIG..."
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="profileId" className="text-sm font-medium">
                Profile ID
              </label>
              <Input
                id="profileId"
                name="profileId"
                value={formData.profileId}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="e.g. 3211012118364113"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="advertiserId" className="text-sm font-medium">
                Advertiser ID
              </label>
              <Input
                id="advertiserId"
                name="advertiserId"
                value={formData.advertiserId}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="Default: Test Advertiser ID"
              />
              <p className="text-xs text-gray-500">
                Using the default test advertiser ID if you don't change this value.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant="default"
          >
            {isSubmitting ? 'Saving...' : 'Save Tokens'}
          </Button>
        </CardFooter>
        
        {success === true && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Tokens saved successfully! You can now use the Amazon Ads API.
            </div>
          </div>
        )}
        
        {success === false && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              Failed to save tokens. Please check the console for more details.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
