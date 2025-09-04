import React, { useState } from 'react'
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Modal,
  Dropdown,
  DataTable,
  useToast
} from '@/components/common'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Heart,
  Settings,
  Download,
  Trash2
} from 'lucide-react'

const ComponentPlayground: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string>('')
  const { showToast } = useToast()

  // Sample data for DataTable
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ]

  const columns = [
    { key: 'id' as keyof typeof sampleData[0], header: 'ID', width: '16' },
    { key: 'name' as keyof typeof sampleData[0], header: 'Name' },
    { key: 'email' as keyof typeof sampleData[0], header: 'Email' },
    { key: 'role' as keyof typeof sampleData[0], header: 'Role' },
    { key: 'status' as keyof typeof sampleData[0], header: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ) }
  ]

  const dropdownItems = [
    { id: 1, label: 'Option 1', value: 'option1' },
    { id: 2, label: 'Option 2', value: 'option2' },
    { id: 3, label: 'Option 3', value: 'option3', disabled: true },
    { id: 4, label: '', divider: true },
    { id: 5, label: 'Option 4', value: 'option4' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Component Playground
          </h1>
          <p className="text-lg text-gray-600">
            Test và khám phá tất cả các UI components có sẵn
          </p>
        </div>

        {/* Buttons Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Buttons</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Variants</h3>
                <div className="space-y-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Sizes</h3>
                <div className="space-y-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">States</h3>
                <div className="space-y-2">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button leftIcon={<Heart />}>With Icon</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Inputs</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  label="Basic Input"
                  placeholder="Enter text..."
                />
                <Input 
                  label="With Left Icon"
                  placeholder="Enter email..."
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input 
                  label="With Error"
                  placeholder="Enter text..."
                  error="This field is required"
                />
              </div>
              
              <div className="space-y-4">
                <Input 
                  label="With Right Icon"
                  placeholder="Enter phone..."
                  rightIcon={<Phone className="w-4 h-4" />}
                />
                <Input 
                  label="Helper Text"
                  placeholder="Enter text..."
                  helperText="This is helpful information"
                />
                <Input 
                  label="Full Width"
                  placeholder="Full width input..."
                  fullWidth
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Cards</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="default" hover clickable>
                <CardHeader>
                  <h3 className="font-semibold">Default Card</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">This is a default card with hover effect</p>
                </CardContent>
              </Card>
              
              <Card variant="elevated" hover>
                <CardHeader>
                  <h3 className="font-semibold">Elevated Card</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">This card has elevation and shadow</p>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardHeader>
                  <h3 className="font-semibold">Outlined Card</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">This card has a border outline</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Modal Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Modal</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">Click the button below to open a modal</p>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dropdown Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Dropdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">Select an option from the dropdown</p>
              <Dropdown
                trigger={<Button variant="outline">Select Option</Button>}
                items={dropdownItems}
                selectedValue={selectedDropdownValue}
                onSelect={(item) => setSelectedDropdownValue(item.value as string)}
                placeholder="Choose an option..."
              />
              <p className="text-sm text-gray-500">
                Selected: {selectedDropdownValue || 'None'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* DataTable Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Data Table</h2>
          </CardHeader>
          <CardContent>
            <DataTable
              data={sampleData}
              columns={columns}
              searchable
              sortable
              pagination
              pageSize={5}
                             onRowClick={(row) => showToast({ title: `Clicked on ${row.name}`, type: 'info' })}
            />
          </CardContent>
        </Card>

        {/* Toast Demo */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Toast Notifications</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="primary" 
                onClick={() => showToast({ title: 'Success message!', type: 'success' })}
              >
                Success
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => showToast({ title: 'Info message!', type: 'info' })}
              >
                Info
              </Button>
              <Button 
                variant="outline" 
                onClick={() => showToast({ title: 'Warning message!', type: 'warning' })}
              >
                Warning
              </Button>
              <Button 
                variant="danger" 
                onClick={() => showToast({ title: 'Error message!', type: 'error' })}
              >
                Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Modal"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a sample modal with some content. You can put any content here.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
                             showToast({ title: 'Action completed!', type: 'success' })
              setIsModalOpen(false)
            }}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ComponentPlayground
