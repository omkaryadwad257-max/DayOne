/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Crosshair } from "lucide-react";
import { FocusItem } from "../types";

export default function FocusGoal() {
  const [items, setItems] = useState<FocusItem[]>(() => {
    const saved = localStorage.getItem("dayone_focus_items");
    return saved ? JSON.parse(saved) : [
      { id: "1", text: "Master dynamic programming recursion trees", completed: false, createdAt: new Date().toISOString() }
    ];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("dayone_focus_items", JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newItem: FocusItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setItems((prev) => [...prev, newItem]);
    setInput("");
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const activeCount = items.filter((i) => !i.completed).length;

  return (
    <div className="bg-[#111119]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group max-w-lg w-full" id="focus-goal-card">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#6C63FF]/5 rounded-full blur-2xl group-hover:bg-[#6C63FF]/10 transition-colors duration-500 pointer-events-none" />

      <h2 className="text-sm font-semibold text-[#8e8e9f] tracking-wider uppercase mb-4 flex items-center gap-2 font-mono">
        <Crosshair size={14} className="text-[#6C63FF]" />
        Today's Learning Strategy
      </h2>

      {/* Input Form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What concept or milestone are you tackling?"
          className="flex-1 bg-white/[0.03] border border-white/5 focus:border-[#6C63FF]/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all placeholder-[#555]"
          maxLength={80}
        />
        <button
          type="submit"
          className="bg-[#6C63FF]/20 hover:bg-[#6C63FF] text-white p-2.5 rounded-xl border border-[#6C63FF]/30 hover:border-[#6C63FF] transition-all cursor-pointer flex items-center justify-center aspect-square"
          title="Add strategy checkpoint"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Focus Items List */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 customize-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-[#555] font-mono">No focal goals queued for today.</p>
            <p className="text-xs text-[#444] mt-1">Add a checkpoint to construct your focus loop.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                item.completed
                  ? "bg-white/[0.01] border-white/[0.02] opacity-50"
                  : "bg-white/[0.02] hover:bg-white/[0.03] border-white/[0.04] hover:border-white/10"
              }`}
            >
              <div
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    item.completed
                      ? "bg-[#6C63FF] border-[#6C63FF]"
                      : "border-white/20 hover:border-[#6C63FF]/50"
                  }`}
                >
                  {item.completed && <Check size={12} className="text-white" />}
                </div>
                <span
                  className={`text-sm text-white font-medium break-all line-clamp-2 max-w-[85%] ${
                    item.completed ? "line-through text-white/40" : ""
                  }`}
                >
                  {item.text}
                </span>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-[#555] hover:text-[#ff4D4D] p-1 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer focus:opacity-100"
                title="Delete checkpoint"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Metrics */}
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-[#555] font-mono">
          <span>{activeCount} PENDING CHECKS</span>
          <span>{Math.round(((items.length - activeCount) / items.length) * 100)}% COMPLETE</span>
        </div>
      )}
    </div>
  );
}
