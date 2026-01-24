import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Pencil, Save } from "lucide-react";
import { Input } from "../ui/input";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    name: string;
    type: string;
    accountNumber: string;
    iban: string;
    currency: string;
    balance: number;
    availableBalance: number;
    // Add more account details as needed
  };
}

export function AccountDetailsModal({ isOpen, onClose, account }: AccountDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [accountName, setAccountName] = useState(account.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!accountName.trim()) {
      setError('Account name cannot be empty');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would call your API here:
      // await updateAccountName(account.id, accountName);
      
      // Update local state
      account.name = accountName;
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update account name. Please try again.');
      console.error('Error updating account name:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
        <DialogHeader>
          <div className="flex justify-between items-center">
            {isEditing ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="text-xl font-semibold"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAccountName(account.name);
                      setIsEditing(false);
                      setError(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <DialogTitle className="text-xl font-semibold">
                {accountName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit account name</span>
                </Button>
              </DialogTitle>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Account Type</h4>
              <p className="text-sm text-foreground">{account.type}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Account Number</h4>
              <p className="text-sm font-mono text-foreground">{account.accountNumber}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">IBAN</h4>
            <p className="text-sm font-mono text-foreground">{account.iban}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Current Balance</h4>
              <p className="text-lg font-medium text-foreground">
                {account.currency} {account.balance.toFixed(2)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Available Balance</h4>
              <p className="text-lg font-medium text-foreground">
                {account.currency} {account.availableBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Add more account details as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
