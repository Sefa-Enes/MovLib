import { DiscoverMovieFilters } from "@/utils/queryBuilder";
import { Filter, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

interface Props {
  onPress?: () => void;
  filters?: DiscoverMovieFilters | undefined;
  setFilters: (item: DiscoverMovieFilters | undefined) => void;
}
export const FilterModal = ({ filters, setFilters, onPress }: Props) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      <View className="w-12 h-12">
        <TouchableOpacity
          onPress={() => setModalOpen(true)}
          className="w-12 h-12 ml-1 rounded-full items-center justify-center  bg-primary"
        >
          <Filter className="size-4 text-gray-400" />
        </TouchableOpacity>

        <Modal
          visible={modalOpen}
          animationType="slide"
          onRequestClose={() => setModalOpen(false)}
        >
          <View className="flex-1 bg-dark-100">
            <TouchableOpacity
              onPress={() => setModalOpen(false)}
              className="self-end p-4"
            >
              <X className="text-white" size={24} />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </>
  );
};
