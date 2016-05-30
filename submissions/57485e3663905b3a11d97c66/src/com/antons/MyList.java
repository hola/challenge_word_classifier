package com.antons;

public class MyList{
    public class MyNode{
        public String value;
        public MyNode next;
        public MyNode prev;
        
        public MyNode(String s){
            value = s;
        }
    }
    
    MyNode root;


    public void Add(String s){
        MyNode newNode = new MyNode(s);
        
        if (root == null){
            root = newNode;
        }
        else{
            newNode.next = root;
            root = newNode;
        }
    }

}