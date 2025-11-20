import { DatePicker } from "@src/components/datepicker";
import { Button } from "@src/components/ui/button";
import { CategorySelect } from "@src/components/category-select";
import { Input } from "@src/components/ui/input";
import { Textarea } from "@src/components/ui/textarea";
import { useUiStore } from "@src/store/ui";
import { useState } from "react";
import { ExpenseForm } from "@src/store/type";
import { addExpense } from "@src/lib/expense";
import { toast } from "react-toastify";

const defaultForm: ExpenseForm = {
  amount: "",
  date: null,
  note: "",
  categories: [],
};
export function Expenses() {
  const { categories, recentlySelectedDate, users, setRecentlySelectedDate } =
    useUiStore();
  const [form, setForm] = useState<ExpenseForm>({
    ...defaultForm,
    date: recentlySelectedDate,
  });

  const handleAddExpense = async () => {
    if (
      !form.amount ||
      !form.date ||
      form.categories.length === 0 ||
      !users.selectedId
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      await addExpense(form, users.selectedId);
      setRecentlySelectedDate(form.date);
      setForm(defaultForm);
      toast.success("Expense added successfully");
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  return (
    <div className="p-4 text-slate-100 h-full">
      <h1 className="text-xl font-semibold">Add New Expense</h1>
      <p>Enter the details of your expense to add it to your records.</p>
      <div>
        <div className="flex gap-2">
          <Input
            label="Amount"
            placeholder="Enter the amount"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <DatePicker
            label="Date"
            defaultValue={form.date}
            onChange={(date) =>
              setForm({ ...form, date: Math.floor(date.getTime() / 1000) })
            }
          />
        </div>

        <div className="mt-2">
          <Textarea
            label="Note"
            placeholder="Enter the note"
            fullWidth
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>
        <CategorySelect
          id="categories"
          label="Category"
          categories={categories}
          value={form.categories}
          onChange={(actionMeta) => {
            if (actionMeta.action === "clear") {
              setForm({ ...form, categories: [] });
              return;
            }
            if (actionMeta.action === "remove-value") {
              setForm({
                ...form,
                categories: form.categories.filter(
                  (c) => c !== actionMeta.removedValue?.value
                ),
              });
              return;
            }
            if (
              actionMeta.action === "select-option" &&
              actionMeta.option?.value
            ) {
              setForm({
                ...form,
                categories: [...form.categories, actionMeta.option?.value],
              });
              return;
            }
          }}
          placeholder="Search categories..."
        />
        <div className="mt-2 flex justify-end">
          <Button variant="primary" onClick={handleAddExpense}>
            Add Expense
          </Button>
        </div>
      </div>
    </div>
  );
}
