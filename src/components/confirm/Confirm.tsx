import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal/Modal";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const Confirm = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-6 p-5">
        <p className="text-sm text-foreground">{message}</p>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} color="accent">
            Cancel
          </Button>

          <Button onClick={onConfirm} color="secondary">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
