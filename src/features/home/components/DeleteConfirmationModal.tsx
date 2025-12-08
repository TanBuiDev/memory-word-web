interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
    targetName: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    count,
    targetName
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                <h3 className="text-2xl font-bold text-red-600 mb-4">
                    ⚠️ Confirm Deletion
                </h3>

                <p className="text-gray-700 mb-3">
                    You're about to delete <span className="font-bold text-red-600">{count} words</span> from <span className="font-medium">{targetName}</span>.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    This action cannot be undone. These words will be removed from all categories.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow"
                    >
                        Delete {count} words
                    </button>
                </div>
            </div>
        </div>
    );
}

