"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { User } from "@/types";

import { getCategories } from "@/services/project.service";
import { createCategory, deleteCategory, updateCategory } from "@/services/admin.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Tags, Plus, Trash2, Pencil } from "lucide-react";

type CategoryItem = {
    id: string;
    name: string;
    description?: string;
};

export default function AdminCategoriesPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as unknown as User | undefined;
    const queryClient = useQueryClient();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [editCategory, setEditCategory] = useState({ name: "", description: "" });

    const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
        enabled: currentUser?.role === "ADMIN",
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            toast.success("Category created successfully!");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsAddOpen(false);
            setNewCategory({ name: "", description: "" });
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to create category.";
            toast.error(message || "Failed to create category.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            toast.success("Category deleted.");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Cannot delete category in use by projects.";
            toast.error(message || "Cannot delete category in use by projects.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ categoryId, data }: { categoryId: string; data: { name: string; description?: string } }) =>
            updateCategory(categoryId, data),
        onSuccess: () => {
            toast.success("Category updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsEditOpen(false);
            setEditingCategoryId(null);
            setEditCategory({ name: "", description: "" });
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message
                : "Failed to update category.";
            toast.error(message || "Failed to update category.");
        },
    });

    if (currentUser?.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="mb-4 h-16 w-16 text-neutral-300" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
            </div>
        );
    }

    const handleCreate = () => {
        if (!newCategory.name.trim()) {
            toast.error("Category name is required.");
            return;
        }

        createMutation.mutate({
            name: newCategory.name.trim(),
            description: newCategory.description.trim() || undefined,
        });
    };

    const handleOpenEdit = (category: CategoryItem) => {
        setEditingCategoryId(category.id);
        setEditCategory({
            name: category.name,
            description: category.description || "",
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!editingCategoryId) return;
        if (!editCategory.name.trim()) {
            toast.error("Category name is required.");
            return;
        }

        updateMutation.mutate({
            categoryId: editingCategoryId,
            data: {
                name: editCategory.name.trim(),
                description: editCategory.description.trim() || undefined,
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        <Tags className="h-8 w-8 text-primary" /> Manage Categories
                    </h1>
                    <p className="text-muted-foreground">Define the research topics available for student projects.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : categories.length > 0 ? (
                    categories.map((category) => (
                        <Card key={category.id} className="group relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-500 whitespace-pre-wrap wrap-break-word">
                                    {category.description || "No description provided."}
                                </p>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-4 right-14 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => handleOpenEdit(category)}
                                    disabled={updateMutation.isPending}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-4 right-4 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this category?")) {
                                            deleteMutation.mutate(category.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full rounded-xl border-2 border-dashed bg-white py-16 text-center">
                        <Tags className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                        <h3 className="text-lg font-semibold text-neutral-900">No categories found</h3>
                        <p className="text-neutral-500">You need to add at least one category before students can create projects.</p>
                    </div>
                )}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>Add a new research discipline (e.g., Renewable Energy, AI & Robotics).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <Input
                                placeholder="e.g., Quantum Computing"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                disabled={createMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Textarea
                                placeholder="Briefly describe what fits in this category..."
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                disabled={createMutation.isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending || !newCategory.name.trim()}>
                            {createMutation.isPending ? "Saving..." : "Create Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Category</DialogTitle>
                        <DialogDescription>Modify this category name or description.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <Input
                                value={editCategory.name}
                                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Textarea
                                value={editCategory.description}
                                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editCategory.name.trim()}>
                            {updateMutation.isPending ? "Updating..." : "Update Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
