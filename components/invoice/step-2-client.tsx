'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { FormField, Input } from './form-inputs'

export function Step2Client({
  client,
  onChange,
}: {
  client: InvoiceData['client']
  onChange: (details: Partial<InvoiceData['client']>) => void
}) {
  const handleChange = (field: keyof InvoiceData['client'], value: string) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Client Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Who is this invoice for? Add the client&apos;s details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Company Name" required>
          <Input
            value={client.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="e.g., Acme Corp"
          />
        </FormField>

        <FormField label="Contact Person">
          <Input
            value={client.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Contact name"
          />
        </FormField>

        <FormField label="Email">
          <Input
            type="email"
            value={client.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="client@company.com"
          />
        </FormField>

        <FormField label="Phone">
          <Input
            value={client.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </FormField>

        <FormField label="Street Address" required>
          <Input
            value={client.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="456 Business Blvd"
          />
        </FormField>

        <FormField label="City" required>
          <Input
            value={client.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="New York"
          />
        </FormField>

        <FormField label="State / Province">
          <Input
            value={client.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="NY"
          />
        </FormField>

        <FormField label="Zip / Postal Code">
          <Input
            value={client.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="10001"
          />
        </FormField>

        <FormField label="Country" required>
          <Input
            value={client.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="United States"
          />
        </FormField>

        <FormField label="Tax ID / VAT Number">
          <Input
            value={client.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="98-7654321"
          />
        </FormField>
      </div>
    </div>
  )
}
