'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { Checkbox, FormField, Input } from './form-inputs'

export function Step1Business({
  business,
  onChange,
}: {
  business: InvoiceData['business']
  onChange: (details: Partial<InvoiceData['business']>) => void
}) {
  const handleChange = (field: keyof InvoiceData['business'], value: string | boolean) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Business Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This information will appear on every invoice you create.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Business Name" required>
          <Input
            value={business.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="e.g., Your Company Inc."
          />
        </FormField>

        <FormField label="Owner Name" required>
          <Input
            value={business.ownerName}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            value={business.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
          />
        </FormField>

        <FormField label="Phone">
          <Input
            value={business.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </FormField>

        <FormField label="Street Address" required>
          <Input
            value={business.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main Street"
          />
        </FormField>

        <FormField label="City" required>
          <Input
            value={business.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="San Francisco"
          />
        </FormField>

        <FormField label="State / Province">
          <Input
            value={business.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="CA"
          />
        </FormField>

        <FormField label="Zip / Postal Code">
          <Input
            value={business.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="94105"
          />
        </FormField>

        <FormField label="Country" required>
          <Input
            value={business.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="United States"
          />
        </FormField>

        <FormField label="Tax ID / EIN">
          <Input
            value={business.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="12-3456789"
          />
        </FormField>

        <FormField label="GSTIN">
          <Input
            value={business.gstin ?? ''}
            onChange={(e) => handleChange('gstin', e.target.value)}
            placeholder="29ABCDE1234F1Z5"
          />
        </FormField>

        <FormField label="PAN">
          <Input
            value={business.pan ?? ''}
            onChange={(e) => handleChange('pan', e.target.value)}
            placeholder="ABCDE1234F"
          />
        </FormField>

        <FormField label="Website">
          <Input
            value={business.website ?? ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </FormField>

        <FormField label="Business Type">
          <Input
            value={business.businessType}
            onChange={(e) => handleChange('businessType', e.target.value)}
            placeholder="e.g., Freelancer, Agency, Corporation"
          />
        </FormField>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Your business details are stored locally and never shared without your permission.
        </p>
      </div>
    </div>
  )
}
