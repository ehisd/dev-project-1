"use client";

import { useEffect } from "react";
import { useQuery } from "react-query";

import { fetchTodos } from "../../../actions/messages";

function InfoPage() {
  // eslint-disable-next-line prettier/prettier
  const {  refetch } = useQuery("todos", fetchTodos);



  useEffect(() => {
    refetch(); // Optionally, fetch data on component mount
  }, []);

  return <div className="">InfoPage</div>;
}

export default InfoPage;
