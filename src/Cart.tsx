import React from "react";
import {Product} from "./App.tsx"
import App from "./App";

type Props = {
    cart: Map<number, Product[]>
    addToCart: (product: Product) => void
    removeFromCart: (product: Product) => void
}

const Cart = (props: Props) => {
    const {cart, addToCart, removeFromCart} = props;
    const values = Array.from(cart.values()).flat();
  return <div>
    <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Album id</th>
              <th>Image 1</th>
              <th>Title</th>
              <th>Image 2</th>
            </tr>
          </thead>
          <tbody >
            {values.map((product) => {
              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.albumId}</td>
                  <td> <img src={product.thumbnailUrl} alt="image" height={"50px"} width={"50px"} /></td>
                  <td>{product.title}</td>
                  <td> <img src={product.url} alt="image" height={"50px"} width={"50px"} /></td>
                  <button onClick={() => addToCart(product)}>Add to cart</button>
                  <button onClick={() => removeFromCart(product)}>Remove from cart</button>
                </tr>
              );
            })}
          </tbody>
        </table>
  </div>;
};

export default Cart;