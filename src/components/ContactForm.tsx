
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, AlertCircle } from 'lucide-react';

// Available options for the form selects
const JOB_ROLES = [
  "Marketing Executive",
  "Marketing Manager",
  "Brand Manager",
  "Digital Marketing Specialist",
  "E-commerce Manager",
  "Media Buyer",
  "Other"
];

const AD_SPEND_OPTIONS = [
  "Less than $10k/month",
  "$10k-$50k/month",
  "$50k-$200k/month",
  "$200k-$500k/month",
  "$500k-$1M/month",
  "More than $1M/month"
];

const RETAILERS = [
  "Amazon",
  "Walmart",
  "Target",
  "Instacart",
  "Kroger",
  "CVS",
  "Walgreens",
  "Costco",
  "Other"
];

const SOLUTIONS = [
  "Campaign Management",
  "Analytics & Reporting",
  "Cross-platform Optimization",
  "Budget Allocation",
  "Keyword Intelligence",
  "Creative Optimization",
  "Competitor Analysis"
];

// Countries list (abbreviated for example)
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Other"
];

const ContactForm = () => {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phoneNumber: '',
    companyName: '',
    jobRole: '',
    country: '',
    monthlyAdSpend: '',
    retailers: [] as string[],
    solutions: [] as string[],
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: 'retailers' | 'solutions', item: string) => {
    setFormState(prev => {
      const currentItems = prev[category];
      return {
        ...prev,
        [category]: currentItems.includes(item)
          ? currentItems.filter(i => i !== item)
          : [...currentItems, item]
      };
    });
  };

  const validateForm = () => {
    if (!formState.firstName.trim()) return "First name is required";
    if (!formState.lastName.trim()) return "Last name is required";
    if (!formState.workEmail.trim()) return "Work email is required";
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.workEmail)) return "Please enter a valid email address";
    
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setFormStatus('error');
      return;
    }

    setFormStatus('submitting');
    setErrorMessage('');

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        first_name: formState.firstName,
        last_name: formState.lastName,
        work_email: formState.workEmail,
        phone_number: formState.phoneNumber,
        company_name: formState.companyName,
        job_role: formState.jobRole,
        country: formState.country,
        monthly_ad_spend: formState.monthlyAdSpend,
        retailers: formState.retailers,
        solutions_of_interest: formState.solutions,
      });

      if (error) throw error;
      
      setFormStatus('success');
      // Reset form after successful submission
      setFormState({
        firstName: '',
        lastName: '',
        workEmail: '',
        phoneNumber: '',
        companyName: '',
        jobRole: '',
        country: '',
        monthlyAdSpend: '',
        retailers: [],
        solutions: [],
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      setFormStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
      {formStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">We've received your request and will contact you shortly.</p>
          <Button 
            onClick={() => setFormStatus('idle')} 
            variant="outline"
            className="px-6"
          >
            Submit Another Request
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request a Demo</h3>
            <p className="text-gray-600">Fill out the form below and we'll be in touch soon</p>
          </div>
          
          {formStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name*</label>
              <Input
                id="firstName"
                name="firstName"
                value={formState.firstName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name*</label>
              <Input
                id="lastName"
                name="lastName"
                value={formState.lastName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700">Work Email*</label>
              <Input
                id="workEmail"
                name="workEmail"
                type="email"
                value={formState.workEmail}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formState.phoneNumber}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <Input
                id="companyName"
                name="companyName"
                value={formState.companyName}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">Job Role</label>
              <select
                id="jobRole"
                name="jobRole"
                value={formState.jobRole}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
              >
                <option value="">Select a role</option>
                {JOB_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
              <select
                id="country"
                name="country"
                value={formState.country}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="monthlyAdSpend" className="block text-sm font-medium text-gray-700">Monthly Ad Spend</label>
              <select
                id="monthlyAdSpend"
                name="monthlyAdSpend"
                value={formState.monthlyAdSpend}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
              >
                <option value="">Select range</option>
                {AD_SPEND_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="block text-sm font-medium text-gray-700">Which retailers do you sell on?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RETAILERS.map(retailer => (
                <div key={retailer} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`retailer-${retailer}`}
                    checked={formState.retailers.includes(retailer)}
                    onChange={() => handleCheckboxChange('retailers', retailer)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`retailer-${retailer}`} className="text-sm text-gray-700">{retailer}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="block text-sm font-medium text-gray-700">Solutions you're interested in</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOLUTIONS.map(solution => (
                <div key={solution} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`solution-${solution}`}
                    checked={formState.solutions.includes(solution)}
                    onChange={() => handleCheckboxChange('solutions', solution)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`solution-${solution}`} className="text-sm text-gray-700">{solution}</label>
                </div>
              ))}
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={formStatus === 'submitting'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {formStatus === 'submitting' ? 'Submitting...' : 'Request Demo'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            By submitting this form, you agree to our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.
          </p>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
