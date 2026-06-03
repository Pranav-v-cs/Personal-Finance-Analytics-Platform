import { useState, useCallback, useRef } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Button } from '../components/ui/Button';

const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'utilities', label: 'Utilities', icon: '⚡' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'shopping', label: 'Shopping', icon: '🛍' },
  { id: 'other', label: 'Other', icon: '➕' }
];

export default function QuickAdd({ isMobile = false }) {
  const { categories: apiCategories, createExpenseItem, loading, saving } = useExpenses();
  const [amount, setAmount] = useState('');
  // Initialize selectedCategory from localStorage
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('lastCategory') || '';
  });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const amountRef = useRef(null);

  // Save category usage to localStorage
  const saveCategoryUsage = useCallback((category) => {
    if (!category) return;
    
    const frequentCategories = JSON.parse(localStorage.getItem('frequentCategories') || '[]');
    frequentCategories.push(category);
    // Keep only last 10 entries
    const trimmed = frequentCategories.slice(-10);
    localStorage.setItem('frequentCategories', JSON.stringify(trimmed));
    localStorage.setItem('lastCategory', category);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      if (amountRef.current) amountRef.current.focus();
      return;
    }
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    
      try {
      const expenseData = {
        amount: parseFloat(amount),
        category: selectedCategory,
        date: date,
        title: description || `${selectedCategory} expense`,
        notes: notes || undefined
      };
      
      await createExpenseItem(expenseData);
      
      // Save category usage
      saveCategoryUsage(selectedCategory);
      
      // Reset form
      setAmount('');
      setDescription('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Refocus amount field for next entry
      if (amountRef.current) {
        amountRef.current.focus();
        amountRef.current.select();
      }
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Get categories for chip selection (use API or fallback)
  const categoryOptions = apiCategories.length > 0 
    ? apiCategories.map(cat => ({ 
        id: cat.toLowerCase().replace(/\s+/g, '-'), 
        label: cat, 
        icon: getCategoryIcon(cat) 
      }))
    : DEFAULT_CATEGORIES;

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food': '🍔',
      'Transport': '🚗',
      'Housing': '🏠',
      'Utilities': '⚡',
      'Entertainment': '🎬',
      'Health': '🏥',
      'Shopping': '🛍',
      'Other': '➕',
      'Bills': '🧾',
      'Healthcare': '🏥'
    };
    return iconMap[category] || '🏷️';
  };

  return (
    <div className={isMobile ? 'fixed bottom-4 left-4 right-4 md:static md:w-full md:mb-6' : 'mb-6'}>
      <div className="bg-surface rounded-lg p-4 shadow-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-text">Quick Add Expense</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-muted hover:text-text/80"
          >
            {showMoreOptions ? 'Less Options' : 'More Options'}
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text/70 mb-1">Amount</label>
            <div className="relative">
              <input
                ref={amountRef}
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="0.00"
                className={`
                  block w-full pl-3 pr-10 py-2 rounded-md border border-border/50 bg-bg/50
                  text-text/90 focus:outline-none focus:border-accent focus:ring-accent/20
                  transition-all duration-200
                  ${isFocused ? 'border-accent bg-bg/60' : ''}
                  ${error && !amount ? 'border-danger/50' : ''}
                `}
                autoFocus
                aria-invalid={!!(error && !amount)}
              />
              {error && !amount && (
                <p className="text-xs text-danger mt-1">Please enter an amount</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text/70 mb-1">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`
                    flex flex-col items-center justify-center px-3 py-2 rounded-md
                    border border-border/30 bg-bg/50 text-text/70
                    hover:border-border/50 hover:bg-bg/60
                    focus:outline-none focus:border-accent focus:ring-accent/20
                    transition-all duration-200
                    ${selectedCategory === option.id ? 
                      'border-accent bg-accent/10 text-accent' : ''
                    }
                  `}
                  onClick={() => setSelectedCategory(option.id)}
                  aria-label={`${option.label} category`}
                >
                  <span className="text-xl mb-1">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            {error && !selectedCategory && (
              <p className="text-xs text-danger mt-1">Please select a category</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text/70 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block w-full pl-3 py-2 rounded-md border border-border/50 bg-bg/50
                           text-text/90 focus:outline-none focus:border-accent focus:ring-accent/20
                           transition-all duration-200"
            />
          </div>
          
          {/* More Options - Hidden by default */}
          {showMoreOptions && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Optional description"
                  className="block w-full pl-3 py-2 rounded-md border border-border/50 bg-bg/50
                           text-text/90 focus:outline-none focus:border-accent focus:ring-accent/20
                           transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Additional notes..."
                  rows="2"
                  className="block w-full pl-3 py-2 rounded-md border border-border/50 bg-bg/50
                           text-text/90 focus:outline-none focus:border-accent focus:ring-accent/20
                           transition-all duration-200 resize-none"
                />
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving || loading}
              className="w-full"
            >
              {saving ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
          
          {/* Error Message */}
          {error && (
            <p className="mt-2 text-sm text-danger">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}