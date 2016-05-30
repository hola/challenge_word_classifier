import java.io.*;
import java.nio.ByteBuffer;
import java.util.*;

public class BuildStemStats {

	final static int SKIP_BYTES = 2;
	
	public static class Info implements Comparable<Info> {
		public int tp = 0;
		public int fp = 0;

		public int compareTo(Info x) {
			return (x.tp - x.fp) - (tp - fp);
		}
	}

	static ByteBuffer readNegative (String negativeFile) throws Exception {
		long time0 = System.currentTimeMillis();
		long sum = 0;
		long count = 0;
		long length = 0;

		long tn = 0;
		long fp = 0;
		byte[] buffer = new byte[4096];
		int buffer_off = 0;

		ByteBuffer bb = ByteBuffer.allocate(15 * 128 * 1024 * 1024);

		try (FileInputStream in = new FileInputStream(negativeFile)) {
			while (true) {
				int cnt = in.read(buffer, buffer_off, buffer.length - buffer_off);
				if (cnt <= 0) {
					break;
				}
				int weight = 0;
				boolean w = true;
				int o = 0;
				int l = 0;
				int last = 0;
				for (int i = 0; i < buffer_off + cnt; i++) {
					if (w) {
						if (buffer[i] == 32) {
							w = false;
							o = i + 1;
						} else {
							weight = weight * 10 + (buffer[i] - 48);
						}
					} else if (buffer[i] == 10) {
						l = i - o;
						last = i + 1;
						// if (l <= Config.MAX_LEN) {
						if (true) {
							bb.putInt(weight);
							bb.put((byte) l);
							bb.put((byte) (l + SKIP_BYTES));
							bb.put(buffer, o, l);
							bb.position(bb.position() + SKIP_BYTES);
						}

						sum += weight;
						count += 1;
						length += l;

						w = true;
						weight = 0;
					}
				}
				int y = buffer_off + cnt - last;
				for (int j = 0; j < y; j++) {
					buffer[j] = buffer[last + j];
				}
				buffer_off = y;
			}
		}

		bb.limit(bb.position());
		
		long time1 = System.currentTimeMillis();
		System.out.println(String.format("time:  %d", time1 - time0));
		System.out.println(String.format("sum:   %d", sum));
		System.out.println(String.format("count: %d", count));
		System.out.println(String.format("len:   %d", length));
		System.out.println(String.format("bb:   %d", bb.position()));
		System.out.println(String.format("true negatives:    %d", tn));
		System.out.println(String.format("false positives:   %d", fp));
		
		return bb;
	}
	
	/*
	static ByteBuffer readNegative(String negativeFile) throws Exception {
		File file = new File(negativeFile);
		byte[] data = new byte[(int) file.length()];
		try (FileInputStream in = new FileInputStream(file)) {
			in.read(data);
		}
		return ByteBuffer.wrap(data);
	}
	*/

	static Map<String, Info> readPositive(String positiveFile) throws Exception {
		Map<String, Info> map = new HashMap<>();
		long time0 = System.currentTimeMillis();
		long sum = 0;
		long count = 0;
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(positiveFile)))) {
			while (true) {
				String line = reader.readLine();
				if (line == null) {
					break;
				}
				char[] chars = line.toCharArray();
				int weight = 0;
				int i = 0;
				for (; i < chars.length; i++) {
					if (chars[i] == ' ') {
						break;
					}
					weight = (weight * 10) + ((int) chars[i]) - 48;
				}
				sum += weight;
				String str = new String(chars, i + 1, chars.length - i - 1);
				Info info = map.get(str);
				if (info == null) {
					info = new Info();
					map.put(str, info);
				}
				info.tp += weight;
				count += 1;
			}
		}
		long time1 = System.currentTimeMillis();
		System.out.println(String.format("time:  %d", time1 - time0));
		System.out.println(String.format("sum:   %d", sum));
		System.out.println(String.format("count: %d", count));
		System.out.println(String.format("map1:  %d", map.size()));
		return map;
	}

	public static void update(Map<String, Info> map, ByteBuffer b) {
		long time0 = System.currentTimeMillis();
		long sum = 0;
		long count = 0;
		long length = 0;

		long tn = 0;
		long fp = 0;

		b.position(0);
		while (b.position() < b.limit()) {
			int weight = b.getInt();
			int l = ((int) b.get()) & 0xff;
			int next = ((int) b.get()) & 0xff;
			String str = new String(b.array(), b.position(), l);
			Info info = map.get(str);
			if (info != null) {
				b.position(b.position() - 6);
				b.putInt(0);
				b.get();
				b.get();
				fp += weight;
				info.fp += weight;
			} else {
				tn += weight;
			}
			b.position(b.position() + next);
			sum += weight;
			count += 1;
			length += l;
		}

		long time1 = System.currentTimeMillis();
		System.out.println(String.format("time:  %d", time1 - time0));
		System.out.println(String.format("sum:   %d", sum));
		System.out.println(String.format("count: %d", count));
		System.out.println(String.format("len:   %d", length));
		System.out.println(String.format("bb:   %d", b.position()));
		System.out.println(String.format("true negatives:    %d", tn));
		System.out.println(String.format("false positives:   %d", fp));
		System.out.println(String.format("accuracy:          %.02f", 50.0 * (tn + tn + fp) / (tn + fp)));
	}

	public static Map<String, Info> remap(Map<String, Info> map, String suf1, String suf2, int min) {
		Map<String, Info> map2 = new HashMap<>();
		int n = suf1.length();
		for (String key : map.keySet()) {
			String key2 = key;
			Info info = map.get(key);

			if (key.endsWith(suf1) & key.length() > n + min) {
				key2 = key.substring(0, key.length() - n) + suf2;
			}

			Info info2 = map2.get(key2);
			if (info2 == null) {
				info2 = new Info();
				map2.put(key2, info2);
			}
			info2.tp += info.tp;
			info2.fp += info.fp;
		}
		return map2;
	}

	public static void mutate_suffix(Map<String, Info> map, ByteBuffer b, String sufString, String sufString2, int min) throws Exception {

		long tn = 0;
		long fp = 0;
		long tp = 0;

		Map<String, Info> remap = remap(map, sufString, "", min);
		for (String key : remap.keySet()) {
			Info i = remap.get(key);
			tp += i.tp;
			fp += i.fp;
		}

		b.position(0);
		byte[] suf = sufString.getBytes();
		int n = suf.length;

		byte[] array = b.array();

		while (b.position() < b.limit()) {
			int weight = b.getInt();
			int l = ((int) b.get()) & 0xff;
			int next = ((int) b.get()) & 0xff;
			if (weight > 0 & l > suf.length + min) {
				int p = b.position();
				boolean matched = true;
				for (int i = 0; i < n; i++) {
					if (array[p + l - i - 1] != suf[n - i - 1]) {
						matched = false;
						break;
					}
				}
				if (matched) {
					String str = new String(b.array(), b.position(), l - n);
					Info info = remap.get(str);
					if (info != null) {
						info.fp += weight;
						fp += weight;

						b.position(b.position() - 6);
						b.putInt(0);
						b.get();
						b.get();

					} else {

						b.position(b.position() - 6);
						b.getInt();
						b.put((byte) (l - n));
						b.get();

						tn += weight;
					}
					// System.out.println(str);
					// System.exit(-1);
				} else {
					tn += weight;
				}
				/*
				
				*/
			} else {
				tn += weight;
			}
			b.position(b.position() + next);
		}

		double acc = 100.0 * (tn + tp) / (tp + tn + fp);
		int delta_size = remap.size() - map.size();

		System.out.println(String.format("%-6s %-4s %05.2f %8d %6d", "'" + sufString + "'", "'" + sufString2 + "'", acc, remap.size(), delta_size));

		map.clear();
		map.putAll(remap);
	}

	public static Map<String, Info> remap_pre(Map<String, Info> map, String pre1, String pre2, int min) {
		Map<String, Info> map2 = new HashMap<>();
		int n = pre1.length();
		for (String key : map.keySet()) {
			String key2 = key;
			Info info = map.get(key);

			if (key.startsWith(pre1) & key.length() > n + min) {
				key2 = pre2 + key.substring(n);
			}

			Info info2 = map2.get(key2);
			if (info2 == null) {
				info2 = new Info();
				map2.put(key2, info2);
			}
			info2.tp += info.tp;
			info2.fp += info.fp;
		}
		return map2;
	}

	public static void mutate_prefix(Map<String, Info> map, ByteBuffer b, String sufString, String sufString2, int min) throws Exception {
		long tn = 0;
		long fp = 0;
		long tp = 0;

		Map<String, Info> remap = remap_pre(map, sufString, "", min);
		for (String key : remap.keySet()) {
			Info i = remap.get(key);
			tp += i.tp;
			fp += i.fp;
		}

		b.position(0);
		byte[] suf = sufString.getBytes();
		int n = suf.length;

		byte[] array = b.array();

		while (b.position() < b.limit()) {
			int weight = b.getInt();
			int l = ((int) b.get()) & 0xff;
			int next = ((int) b.get()) & 0xff;
			if (weight > 0 & l > suf.length + min) {
				int p = b.position();
				boolean matched = true;
				for (int i = 0; i < n; i++) {
					if (array[p + i] != suf[i]) {
						matched = false;
						break;
					}
				}
				if (matched) {
					String str = new String(array, p + n, l - n);
					Info info = remap.get(str);
					if (info != null) {
						info.fp += weight;
						fp += weight;

						b.position(b.position() - 6);
						b.putInt(0);
						b.get();
						b.get();

					} else {

						b.position(b.position() - 6);
						b.getInt();
						b.put((byte) (l - n));
						b.get();
						for (int j = 0; j < l - n; j++) {
							array[p + j] = array[p + j + n];
						}

						tn += weight;
					}
					// System.out.println(str);
					// System.exit(-1);
				} else {
					tn += weight;
				}
				/*
				
				*/
			} else {
				tn += weight;
			}
			b.position(b.position() + next);
		}

		double acc = 100.0 * (tn + tp) / (tp + tn + fp);
		int delta_size = remap.size() - map.size();

		System.out.println(String.format("%-6s %-4s %05.2f %8d %6d", "'" + sufString + "'", "'" + sufString2 + "'", acc, remap.size(), delta_size));
		map.clear();
		map.putAll(remap);
	}

	public static void main(String[] args) throws Exception {
		Map<String, Info> map = readPositive(args[0]);
		ByteBuffer buffer = readNegative(args[1]);
		String outputFile = args[2];
		
		update(map, buffer);
		for (String prefix : "inter,super,under,micro,hyper,trans,photo,hydro,multi,proto,tetra,ultra,neuro,macro,ortho,extra,radio,intra,phyto,retro,osteo,supra,angio,infra,benzo,over,anti,semi,poly,para,mono,peri,post,fore,auto,hypo,arch,meta,tele,endo,meso,hemi,pyro,ante,demi,holo,cyto,thio,hemo,non,pre,pro,dis,sub,par,tri,mis,met,uni,pan,epi,mal,ana,syn,iso,apo,bio,geo,neo,zoo,oxy,myo,un,fo,bi,eu,ir,mc".split(",")) {
			mutate_prefix(map, buffer, prefix, "", 3);
		}
		for (String suffix : "ingli,graph,atori,oscop,board,proof,otomi,sburg,mania,antli,ifer,iest,ngli,less,ship,elik,form,land,ogen,fish,ward,metr,town,hood,vers,back,hous,trop,duct,loid,tail,evil,bird,uria,shli,esqu,root,fer,ger,ier,est,vil,oid,man,lik,met,ean,ili,cop,som,dom,wai,bal,typ,par,wel,mor,pos,wis,os,er,ea,li,we".split(",")) {
			mutate_suffix(map, buffer, suffix, "", 3);
		}

		try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(outputFile)))) {
			for (String key : map.keySet()) {
				Info info = map.get(key);
				writer.println("#" + info.tp + " " + info.fp + " " + (100.0 * info.tp / (info.tp + info.fp)) + " " + key);
			}
			writer.flush();
			writer.println();
		}
	}

}
