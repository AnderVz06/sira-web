// src/components/common/ModalMensaje.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
  buttonLabel?: string;
  title?: string;
};

export default function ModalMensaje({
  open,
  message,
  onClose,
  buttonLabel = "Entendido",
  title = "Aviso",
}: Props) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={(_v) => onClose()} className="relative z-[60]">
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-2xl">
                <div className="px-6 py-5">
                  {/* Header (igual estilo que tu success) */}
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-content-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200">
                      <HiOutlineExclamationTriangle size={22} />
                    </span>
                    <Dialog.Title className="text-lg font-extrabold text-slate-900">
                      {title}
                    </Dialog.Title>
                  </div>

                  {/* Bloque de mensaje único */}
                  <div className="mt-4 rounded-xl ring-1 ring-red-200 bg-gradient-to-br from-red-50 to-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-red-700">
                        Mensaje del sistema
                      </div>
                    </div>
                    <div className="mt-1.5 text-red-900 leading-relaxed break-words whitespace-pre-line">
                      {message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {buttonLabel}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
