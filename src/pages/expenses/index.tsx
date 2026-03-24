import { CategorySelect } from "@src/components/category-select";
import { useUiStore } from "@src/store/ui";
import { useState } from "react";
import { ExpenseForm } from "@src/store/type";
import { addExpense } from "@src/lib/expense";
import { toast } from "react-toastify";
import { InputNumber, DatePicker, Input, Button } from "antd";
import styles from "./index.module.scss";
import clsx from "clsx";
import commonStyles from "@src/common.module.scss";

const { TextArea } = Input;

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
      setForm({ ...defaultForm, date: recentlySelectedDate });
      toast.success("Expense added successfully");
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  return (
    <div className="text-slate-100 h-full">
      <p className="fw-black lh-9 text-white-50 fs-6">Add New Expense</p>
      <p className="fs-2 text-zinc-500 mt-1">Enter the details of your expense to add it to your records.</p>
      <div className="my-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="fw-medium fs-3 lh-6 text-white-50 mb-1">Amount</p>
            <InputNumber prefix="₹"
              classNames={{
                actions: styles["hide-custom-btn"],
                root: styles["custom-input-number"]
              }}
              value={form.amount}
              onChange={(value) => setForm({ ...form, amount: value || "" })}
            />
          </div>
          <div className="flex-1">
            <p className="fw-medium fs-3 lh-6 text-white-50 mb-1">Date</p>
            <DatePicker classNames={{
              root: styles["custom-date-picker"],
            }}
              styles={{
                popup: {
                  container: { border: '1px solid #13ec5b', borderRadius: 8 },
                },
              }}
              defaultValue={form.date}
              onChange={(date) => {
                setForm({ ...form, date: date?.valueOf() || null });
              }} />
          </div>
        </div>

        <div className="mt-6">
          <p className="fw-medium fs-3 lh-6 text-white-50 mb-1">Note</p>
          <TextArea
            placeholder="Enter the note"
            value={form.note}
            rows={4}
            classNames={{
              root: styles["custom-textarea"]
            }}
            onChange={(e) => setForm({ ...form, note: e.target.value })} />
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
          <Button type="primary" className={clsx("text-black-50 fw-medium fs-2", commonStyles["primary-btn"])} onClick={handleAddExpense}>
            Save Expense
          </Button>
        </div>
      </div>
    </div>
  );
}
