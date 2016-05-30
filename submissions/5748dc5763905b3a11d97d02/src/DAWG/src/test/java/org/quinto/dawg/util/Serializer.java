package org.quinto.dawg.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

public class Serializer {
    public static <V> V serializeAndRead(V value) throws IOException, ClassNotFoundException {
        byte data[];
        ByteArrayOutputStream baos = null;
        IOException ex = null;
        V ret = null;
        try {
            baos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            try {
                oos.writeObject(value);
                oos.flush();
                data = baos.toByteArray();
            } finally {
                try {
                    oos.close();
                } catch (IOException e) {
                    ex = e;
                }
            }
        } finally {
            if (baos != null) {
                try {
                    baos.close();
                } catch (IOException e) {
                    if (ex == null)
                        ex = e;
                }
            }
        }
        if (ex != null)
            throw ex;
        ByteArrayInputStream bais = null;
        try {
            bais = new ByteArrayInputStream(data);
            ObjectInputStream ois = new ObjectInputStream(bais);
            try {
                ret = (V)ois.readObject();
            } finally {
                try {
                    ois.close();
                } catch (IOException e) {
                    ex = e;
                }
            }
        } finally {
            if (bais != null) {
                try {
                    bais.close();
                } catch (IOException e) {
                    if (ex == null)
                        ex = e;
                }
            }
        }
        if (ex != null)
            throw ex;
        return ret;
    }
}