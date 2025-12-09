import { SortOption } from '../../types';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'prioridade', label: 'Prioridade' },
  { value: 'nome', label: 'Nome (A-Z)' },
  { value: 'preco-asc', label: 'Preço (menor)' },
  { value: 'preco-desc', label: 'Preço (maior)' },
  { value: 'insercao-asc', label: 'Mais antigos' },
  { value: 'insercao-desc', label: 'Mais recentes' },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <label className="text-xs sm:text-sm text-gray-600">Ordenar por:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="input py-1.5 text-xs sm:text-sm w-full sm:w-auto"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
