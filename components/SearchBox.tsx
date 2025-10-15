import { Search, X } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText: (text: string) => void;
}

const SearchBox = ({ onPress, placeholder, value, onChangeText }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-100 rounded-full px-5 py-4 w-[90%]">
      <Search className="size-4 text-gray-400 mr-2" />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="gray-400"
        className="flex-1 text-white ml-2"
      />
      {value && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          className="flex-row items-center justify-center gap-x-2 h-8 w-8 rounded-full"
        >
          <X className="text-accent font-bold" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBox;
