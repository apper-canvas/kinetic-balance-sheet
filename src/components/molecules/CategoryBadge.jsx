import Badge from "@/components/atoms/Badge";
import { categoriesService } from "@/services/api/categoriesService";
import { useState, useEffect } from "react";

const CategoryBadge = ({ categoryName, className }) => {
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await categoriesService.getAll();
        const foundCategory = categories.find(cat => cat.name === categoryName);
        setCategory(foundCategory);
      } catch (error) {
        console.error("Error loading category:", error);
      }
    };

    if (categoryName) {
      loadCategory();
    }
  }, [categoryName]);

  if (!category) {
    return (
      <Badge variant="default" className={className}>
        {categoryName}
      </Badge>
    );
  }

  return (
    <Badge 
      color={category.color} 
      className={className}
    >
      {category.name}
    </Badge>
  );
};

export default CategoryBadge;